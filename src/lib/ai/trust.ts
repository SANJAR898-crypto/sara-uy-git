/**
 * AI Moderator + AI Fraud Detector (Phase 9)
 *
 * Centralised trust & safety pipeline for listings. Runs fast, deterministic
 * heuristics (always available, zero cost) and — when `OPENAI_API_KEY` is
 * configured — refines the decision with a real LLM moderation pass via the
 * shared `@/lib/ai/provider`. Results are persisted on `properties_ai` so the
 * Admin panel, sellers and the fraud dashboard can all read a single source
 * of truth instead of recomputing on every page view.
 */
import { db } from "@/db";
import { properties, propertiesAi, users } from "@/db/schema";
import type { PropertyRow } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { moderationPrompt } from "@/lib/ai/prompts";
import { parseJsonSafely, safeComplete } from "@/lib/ai/provider";
import { computePriceAdvice } from "@/lib/ai";
import { queryProperties } from "@/lib/properties-query";
import { withAiLogging } from "@/lib/ai/logger";

export type ModerationDecision = "approve" | "reject" | "flag" | "needs_review";

export interface ModerationResult {
  decision: ModerationDecision;
  score: number; // 0-100 trust score, 100 = fully trustworthy
  reasons: string[];
  source: "heuristic" | "ai";
}

export interface FraudResult {
  fraudScore: number; // 0-100, higher = more suspicious
  signals: string[];
  source: "heuristic";
}

const SCAM_PATTERNS = [
  /kafolat\s*100/i,
  /tez\s*boy(i|у)sh/i,
  /bepul\s*pul/i,
  /moliyaviy\s*piramida/i,
  /investitsiya\s*kafolati/i,
  /wa\.me\//i,
  /bit\.ly\//i,
  /western\s*union/i,
  /100%\s*daromad/i,
];

const PHONE_IN_TEXT = /(\+?\d[\d\s\-()]{6,}\d)/;
const TELEGRAM_HANDLE = /@[a-zA-Z0-9_]{4,}/;

function heuristicModeration(property: Pick<PropertyRow, "title" | "description" | "price">): {
  score: number;
  reasons: string[];
  decision: ModerationDecision;
} {
  const reasons: string[] = [];
  let score = 100;

  const title = property.title || "";
  const description = property.description || "";
  const combined = `${title} ${description}`;

  if (PHONE_IN_TEXT.test(title)) {
    score -= 20;
    reasons.push("Sarlavhada telefon raqami aniqlandi");
  }
  if (TELEGRAM_HANDLE.test(title)) {
    score -= 10;
    reasons.push("Sarlavhada ijtimoiy tarmoq/telegram nik aniqlandi");
  }
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(combined)) {
      score -= 30;
      reasons.push("Firibgarlikka xos so'z birikmasi topildi");
      break;
    }
  }
  if (title.trim().length < 8) {
    score -= 15;
    reasons.push("Sarlavha juda qisqa");
  }
  if (description.trim().length < 20) {
    score -= 15;
    reasons.push("Tavsif juda qisqa yoki bo'sh");
  }
  if (title.length > 12 && title === title.toUpperCase()) {
    score -= 10;
    reasons.push("Sarlavha butunlay katta harflarda (spamga xos)");
  }
  if (/[!$]{3,}/.test(combined)) {
    score -= 10;
    reasons.push("Ortiqcha undov/pul belgilari ishlatilgan");
  }
  if (Number(property.price) <= 0) {
    score -= 20;
    reasons.push("Narx ko'rsatilmagan yoki noto'g'ri");
  }

  score = Math.max(0, Math.min(100, score));
  const decision: ModerationDecision =
    score >= 80 ? "approve" : score >= 55 ? "needs_review" : score >= 35 ? "flag" : "reject";

  return { score, reasons, decision };
}

/** Runs the full AI Moderator pipeline for a single property (heuristic + optional real LLM refinement). */
export async function runAiModeration(property: PropertyRow): Promise<ModerationResult> {
  const heuristic = heuristicModeration(property);

  const completion = await safeComplete(
    [
      { role: "system", content: "You are a strict, fair real-estate content moderator. Always respond with strict JSON." },
      {
        role: "user",
        content: moderationPrompt({ title: property.title, description: property.description, price: property.price, category: property.category }),
      },
    ],
    { temperature: 0.1, maxTokens: 300, jsonMode: true }
  );

  if (completion) {
    const parsed = parseJsonSafely<{ decision?: ModerationDecision; score?: number; reasons?: string[] }>(completion.text);
    if (parsed?.decision) {
      return {
        decision: parsed.decision,
        score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, parsed.score)) : heuristic.score,
        reasons: parsed.reasons?.length ? parsed.reasons : heuristic.reasons,
        source: "ai",
      };
    }
  }

  return { ...heuristic, source: "heuristic" };
}

/** Runs the AI Fraud Detector: duplicate listings, duplicate photos, scam pricing, suspicious seller behaviour. */
export async function runFraudDetection(property: PropertyRow): Promise<FraudResult> {
  const signals: string[] = [];
  let fraudScore = 0;

  // 1) Duplicate title elsewhere on the platform.
  const [{ count: duplicateTitleCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(properties)
    .where(sql`${properties.id} != ${property.id} and lower(${properties.title}) = lower(${property.title}) and ${properties.status} != 'rejected'`);
  if (duplicateTitleCount > 0) {
    fraudScore += 25;
    signals.push("Boshqa e'londa bir xil sarlavha topildi (nusxa bo'lishi mumkin)");
  }

  // 2) Duplicate photos reused from another listing.
  const candidateImages = (property.images || []).filter((img) => img && img !== "/images/logo.png").slice(0, 3);
  for (const img of candidateImages) {
    const [{ count: dupImageCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(sql`${properties.id} != ${property.id} and ${properties.images} @> ${JSON.stringify([img])}::jsonb`);
    if (dupImageCount > 0) {
      fraudScore += 30;
      signals.push("Rasm(lar) boshqa e'londa ham ishlatilgan");
      break;
    }
  }

  // 3) Scam pricing — far below market comparables.
  try {
    const comparables = await queryProperties({
      status: "active",
      category: property.category,
      dealType: property.dealType,
      city: property.city,
      limit: 200,
    });
    const advice = computePriceAdvice(comparables, { area: property.area, rooms: property.rooms });
    if (advice && Number(property.price) < advice.low * 0.5) {
      fraudScore += 25;
      signals.push("Narx bozor o'rtachasidan sezilarli darajada past (shubhali)");
    }
  } catch {
    // best-effort — never block on market comparison failures
  }

  // 4) Seller velocity — many pending listings created very recently.
  const [{ count: recentPending }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(properties)
    .where(sql`${properties.sellerId} = ${property.sellerId} and ${properties.status} = 'pending' and ${properties.createdAt} > now() - interval '24 hours'`);
  if (recentPending > 3) {
    fraudScore += 20;
    signals.push("Sotuvchi qisqa vaqt ichida juda ko'p e'lon joylashtirmoqda");
  }

  // 5) Brand-new account posting immediately.
  const sellerRows = await db.select().from(users).where(eq(users.id, property.sellerId)).limit(1);
  const seller = sellerRows[0];
  if (seller) {
    const accountAgeMs = Date.now() - new Date(seller.createdAt).getTime();
    if (accountAgeMs < 60 * 60 * 1000 && recentPending >= 2) {
      fraudScore += 15;
      signals.push("Yangi ro'yxatdan o'tgan hisobdan tez-tez e'lon joylashtirilmoqda");
    }
  }

  return { fraudScore: Math.max(0, Math.min(100, fraudScore)), signals, source: "heuristic" };
}

/**
 * Orchestrates the full AI Trust pipeline for one property and persists the
 * outcome on `properties_ai`. Best-effort: never throws to callers that fire
 * this in the background (e.g. right after listing submission).
 */
export async function evaluatePropertyWithAi(propertyId: number): Promise<{ moderation: ModerationResult; fraud: FraudResult } | null> {
  const rows = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  const property = rows[0];
  if (!property) return null;

  return withAiLogging(
    "ai.trust",
    { metadata: { propertyId } },
    async () => {
      const [moderation, fraud] = await Promise.all([runAiModeration(property), runFraudDetection(property)]);

      await db
        .insert(propertiesAi)
        .values({
          propertyId,
          moderationStatus: moderation.decision === "approve" ? "approved" : moderation.decision,
          moderationReasons: moderation.reasons,
          moderationScore: moderation.score,
          fraudScore: fraud.fraudScore,
          fraudSignals: fraud.signals,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: propertiesAi.propertyId,
          set: {
            moderationStatus: moderation.decision === "approve" ? "approved" : moderation.decision,
            moderationReasons: moderation.reasons,
            moderationScore: moderation.score,
            fraudScore: fraud.fraudScore,
            fraudSignals: fraud.signals,
            updatedAt: new Date(),
          },
        });

      return { result: { moderation, fraud }, provider: moderation.source === "ai" ? "openai" : "heuristic" };
    }
  );
}

export async function getPropertyTrustSnapshot(propertyId: number) {
  const rows = await db.select().from(propertiesAi).where(eq(propertiesAi.propertyId, propertyId)).limit(1);
  return rows[0] ?? null;
}
