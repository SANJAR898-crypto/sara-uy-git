/**
 * Sara Uylar — AI Assist service architecture (Phase 4).
 *
 * This module intentionally does NOT call any paid external AI provider yet.
 * It defines a clean, provider-agnostic interface so a real LLM/vision model
 * can be plugged in later (e.g. OpenAI, Gemini) simply by implementing
 * `AiProvider` and wiring it up in `getAiProvider()` — no call-site changes
 * needed anywhere else in the app.
 *
 * Today it runs on deterministic heuristics so the "AI Assist" UI in the
 * listing wizard is fully functional out of the box.
 */
import { CATEGORY_META } from "@/lib/constants";
import { computePriceAdvice, type PriceAdviceResult } from "@/lib/ai";
import { queryProperties } from "@/lib/properties-query";
import type { AiAssistResult } from "@/types";

export interface AiAssistInput {
  category: string;
  dealType: string;
  city: string;
  district?: string;
  rooms?: number;
  area?: number;
  amenities?: string[];
}

export interface AiProvider {
  name: "heuristic" | "openai";
  generateTitle(input: AiAssistInput): Promise<string>;
  generateDescription(input: AiAssistInput): Promise<string>;
  generateTags(input: AiAssistInput): Promise<string[]>;
}

/** Deterministic, offline fallback provider — always available. */
class HeuristicAiProvider implements AiProvider {
  name = "heuristic" as const;

  async generateTitle(input: AiAssistInput): Promise<string> {
    const label = CATEGORY_META[input.category]?.label ?? "Ko'chmas mulk";
    const dealLabel = input.dealType === "rent" ? "ijaraga" : "sotiladi";
    const roomsPart = input.rooms ? `${input.rooms} xonali ` : "";
    const areaPart = input.area ? `, ${input.area} m²` : "";
    return `${input.district ?? input.city}da ${roomsPart}${label.toLowerCase()} ${dealLabel}${areaPart}`;
  }

  async generateDescription(input: AiAssistInput): Promise<string> {
    const label = CATEGORY_META[input.category]?.label ?? "Ko'chmas mulk";
    const amenitiesText = input.amenities?.length ? ` Qulayliklar: ${input.amenities.join(", ")}.` : "";
    return (
      `${label} ${input.city}${input.district ? `, ${input.district}` : ""} hududida joylashgan. ` +
      `${input.rooms ? `${input.rooms} xonali, ` : ""}${input.area ? `${input.area} m² maydonga ega. ` : ""}` +
      `Barcha kerakli infratuzilma yaqin atrofda mavjud.${amenitiesText}`
    ).trim();
  }

  async generateTags(input: AiAssistInput): Promise<string[]> {
    const tags = [input.category, input.dealType, input.city];
    if (input.district) tags.push(input.district);
    if (input.rooms) tags.push(`${input.rooms}-xona`);
    if (input.amenities) tags.push(...input.amenities);
    return Array.from(new Set(tags.filter(Boolean)));
  }
}

/**
 * Reserved for a future real AI integration. Returns null today so callers
 * gracefully fall back to the heuristic provider — flip this on once an API
 * key + provider implementation are available.
 */
function getRealAiProvider(): AiProvider | null {
  if (!process.env.OPENAI_API_KEY) return null;
  // TODO(Phase 5): implement OpenAiProvider that calls the Chat Completions
  // API using process.env.OPENAI_API_KEY and return it here.
  return null;
}

export function getAiProvider(): AiProvider {
  return getRealAiProvider() ?? new HeuristicAiProvider();
}

export async function generateListingAssist(input: AiAssistInput): Promise<AiAssistResult> {
  const provider = getAiProvider();
  const [title, description, tags] = await Promise.all([
    provider.generateTitle(input),
    provider.generateDescription(input),
    provider.generateTags(input),
  ]);
  return { title, description, tags, source: provider.name === "openai" ? "ai" : "heuristic" };
}

export async function getAiPriceAdvice(input: AiAssistInput): Promise<PriceAdviceResult | null> {
  let comparables = await queryProperties({
    status: "active",
    category: input.category,
    dealType: input.dealType,
    city: input.city,
    limit: 200,
  });
  if (comparables.length < 3) {
    comparables = await queryProperties({ status: "active", category: input.category, dealType: input.dealType, limit: 200 });
  }
  return computePriceAdvice(comparables, { area: input.area, rooms: input.rooms });
}
