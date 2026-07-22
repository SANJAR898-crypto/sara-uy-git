/**
 * AI Smart Chat + AI Negotiation Assistant (Phase 9)
 *
 * "Sara AI" — the in-app buyer assistant. Answers district comparisons,
 * investment questions, price sanity checks and negotiation strategy. Uses
 * the real LLM (via `@/lib/ai/provider`) when configured, grounded with a
 * live market-data snippet, and always falls back to a deterministic,
 * data-driven heuristic responder so the feature works with zero external
 * dependencies. Every turn is persisted to `ai_chat_messages`.
 */
import { db } from "@/db";
import { aiChatMessages, properties } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import { safeComplete, type ChatMessage } from "@/lib/ai/provider";
import { computeMarketIntelligence } from "@/lib/ai/market";
import { computePriceAdvice } from "@/lib/ai";
import { queryProperties } from "@/lib/properties-query";
import { withAiLogging } from "@/lib/ai/logger";

export interface ChatReply {
  reply: string;
  source: "heuristic" | "ai";
  sessionId: string;
}

async function buildMarketContext(): Promise<string> {
  const market = await computeMarketIntelligence({});
  const topDistricts = market.districtRanking
    .slice(0, 5)
    .map((d) => `${d.district} (${d.city}): o'rtacha ${d.avgPrice.toLocaleString()} $, talab ${d.demandScore}/100`)
    .join("; ");
  const trend =
    market.priceTrend.changePct != null
      ? `Oxirgi 30 kunda narxlar ${market.priceTrend.changePct > 0 ? "+" : ""}${market.priceTrend.changePct}% o'zgardi.`
      : "Narx dinamikasi uchun yetarli tarixiy ma'lumot yo'q.";
  return `Faol e'lonlar: ${market.totalActive}. Eng talabgir hududlar: ${topDistricts || "ma'lumot yo'q"}. ${trend}`;
}

function heuristicReply(message: string): string {
  const lower = message.toLowerCase();
  if (/(qaysi hudud|qaysi tuman|which district|какой район)/.test(lower)) {
    return "Hozircha eng ko'p qidirilayotgan hududlar Yunusobod va Chilonzor — narxlar barqaror, infratuzilma rivojlangan. Aniqroq tavsiya uchun byudjetingiz va oila hajmingizni yozing.";
  }
  if (/(qimmat|expensive|дорого)/.test(lower)) {
    return "Narx bozor o'rtachasiga solishtirilganda baholanadi. Aniq e'lon havolasini yuboring — men uni shu hudud/komnatalar soni bo'yicha o'xshash e'lonlar bilan solishtirib beraman.";
  }
  if (/(kelishish|savdolashish|negotiat|торг)/.test(lower)) {
    return "Kelishuv uchun odatda e'lon narxidan 5-10% pastroq taklif qilish oqilona. Sotuvchi \"kelishiladi\" belgisini qo'ygan bo'lsa, imkoniyat yanada yuqori.";
  }
  if (/(investitsiya|investment|инвестиц)/.test(lower)) {
    return "Investitsiya uchun talabi o'sib borayotgan va narx dinamikasi ijobiy hududlarni tanlang. Aniq tuman nomini yozsangiz, men joriy bozor tahlilini keltira olaman.";
  }
  return "Men Sara AI — ko'chmas mulk bo'yicha yordamchingizman. Byudjet, hudud, oila hajmi yoki investitsiya maqsadingizni yozing, men mos e'lonlar va tavsiyalar bera olaman.";
}

export async function getChatHistory(sessionId: string, limit = 30) {
  return db
    .select()
    .from(aiChatMessages)
    .where(eq(aiChatMessages.sessionId, sessionId))
    .orderBy(asc(aiChatMessages.createdAt))
    .limit(limit);
}

export async function chatWithSaraAI(input: {
  sessionId: string;
  userId: number | null;
  message: string;
  language?: string;
  propertyId?: number | null;
}): Promise<ChatReply> {
  const language = input.language || "uz";

  await db.insert(aiChatMessages).values({
    userId: input.userId,
    sessionId: input.sessionId,
    role: "user",
    content: input.message,
    language,
    propertyId: input.propertyId ?? null,
  });

  return withAiLogging(
    "ai.chat",
    { userId: input.userId, metadata: { sessionId: input.sessionId } },
    async () => {
      const history = await getChatHistory(input.sessionId, 12);
      const context = await buildMarketContext();

      const messages: ChatMessage[] = [
        { role: "system", content: chatSystemPrompt(language, context) },
        ...history.slice(-10).map((h) => ({ role: h.role as ChatMessage["role"], content: h.content })),
      ];

      const completion = await safeComplete(messages, { temperature: 0.5, maxTokens: 400 });
      const reply = completion?.text?.trim() || heuristicReply(input.message);
      const source: "heuristic" | "ai" = completion?.text ? "ai" : "heuristic";

      await db.insert(aiChatMessages).values({
        userId: input.userId,
        sessionId: input.sessionId,
        role: "assistant",
        content: reply,
        language,
        propertyId: input.propertyId ?? null,
      });

      return { result: { reply, source, sessionId: input.sessionId }, provider: source === "ai" ? "openai" : "heuristic", model: completion?.model };
    }
  );
}

/* ============================================================
   AI Negotiation Assistant
   ============================================================ */
export interface NegotiationAdvice {
  propertyId: string;
  listedPrice: number;
  recommendedOffer: number;
  fairPrice: number | null;
  negotiationMargin: number;
  closingProbability: number; // 0-100
  strategy: string[];
  explanation: string;
}

export async function getNegotiationAdvice(propertyId: number, offerPrice?: number | null): Promise<NegotiationAdvice | null> {
  const rows = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  const property = rows[0];
  if (!property) return null;

  const comparables = await queryProperties({
    status: "active",
    category: property.category,
    dealType: property.dealType,
    city: property.city,
    limit: 200,
  });
  const advice = computePriceAdvice(comparables, { area: property.area, rooms: property.rooms });
  const listedPrice = Number(property.price);
  const fairPrice = advice?.fair ?? null;

  const negotiationMargin = fairPrice != null ? Math.round(Math.max(listedPrice - advice!.low, listedPrice * 0.05)) : Math.round(listedPrice * 0.08);
  const recommendedOffer = Math.round(Math.max(listedPrice - negotiationMargin, fairPrice ? advice!.low : listedPrice * 0.85));

  const referenceOffer = offerPrice ?? recommendedOffer;
  let closingProbability = 60;
  if (fairPrice) {
    const diffPct = Math.abs(referenceOffer - fairPrice) / fairPrice;
    closingProbability = Math.round(Math.max(5, Math.min(95, 90 - diffPct * 150)));
  }

  const strategy: string[] = [];
  if (property.negotiable) strategy.push("Sotuvchi \"narx kelishiladi\" belgisini qo'ygan — muzokara ehtimoli yuqori.");
  strategy.push(`Boshlang'ich taklif sifatida ${recommendedOffer.toLocaleString()} ${property.currency} taklif qiling.`);
  if (fairPrice) strategy.push(`Bozor tahliliga ko'ra adolatli narx taxminan ${fairPrice.toLocaleString()} ${property.currency}.`);
  strategy.push("Uzoq muddat bozorda turgan e'lonlarda sotuvchilar ko'proq chegirmaga rozi bo'ladi.");
  if (property.installment || property.mortgage) strategy.push("To'lov moslashuvchanligi (bo'lib to'lash/ipoteka) mavjudligi kelishuvni osonlashtiradi.");

  return {
    propertyId: String(property.id),
    listedPrice,
    recommendedOffer,
    fairPrice,
    negotiationMargin,
    closingProbability,
    strategy,
    explanation: fairPrice
      ? `Taklif qilingan narx (${recommendedOffer.toLocaleString()}) bozor bo'yicha adolatli narxga (${fairPrice.toLocaleString()}) yaqin — bitim yopilish ehtimoli ${closingProbability}%.`
      : `Taqqoslash uchun yetarli bozor ma'lumoti yo'q — taxminiy bitim ehtimoli ${closingProbability}%.`,
  };
}
