/**
 * AI Category Detection + AI Location Understanding + AI Keyword Generator
 *
 * Given free-form text (title, description or a raw address a seller
 * pastes in), infers the property category, normalizes the city/district
 * against our known gazetteer (handling common spelling variants), and
 * produces search keywords. Uses a real LLM when configured, otherwise
 * falls back to fast deterministic heuristics so the feature always works.
 */
import { CATEGORY_META, CITIES, DISTRICTS } from "@/lib/constants";
import { categoryDetectionPrompt } from "@/lib/ai/prompts";
import { parseJsonSafely, safeComplete } from "@/lib/ai/provider";

export interface UnderstandResult {
  category: string;
  city: string | null;
  district: string | null;
  dealType: "sale" | "rent" | null;
  keywords: string[];
  confidence: number;
  source: "heuristic" | "ai";
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  apartment: ["kvartira", "квартира", "apartment", "xonadon"],
  house: ["hovli", "uy ", " uy", "дом", "house", "kottedj"],
  villa: ["villa", "вилла", "kottej"],
  office: ["ofis", "офис", "office", "biznes markaz", "do'kon", "магазин", "shop"],
  land: ["yer", "uchastka", "участок", "land", "tomorqa"],
  rent: ["ijara", "аренда", "rent", "arenda"],
};

// Common alternate spellings / transliterations mapped to the canonical name
// used in our CITIES/DISTRICTS constants.
const DISTRICT_ALIASES: Record<string, string> = {
  "mirzo ulugbek": "Mirzo Ulug'bek",
  "mirzo ulug'bek": "Mirzo Ulug'bek",
  "мирзо улугбек": "Mirzo Ulug'bek",
  chilonzor: "Chilonzor",
  чиланзар: "Chilonzor",
  yunusobod: "Yunusobod",
  юнусабад: "Yunusobod",
  yakkasaroy: "Yakkasaroy",
  якkасарой: "Yakkasaroy",
  shayxontohur: "Shayxontohur",
  шайхантахур: "Shayxontohur",
  sergeli: "Sergeli",
  сергели: "Sergeli",
};

const CITY_ALIASES: Record<string, string> = {
  toshkent: "Toshkent",
  ташкент: "Toshkent",
  tashkent: "Toshkent",
  samarqand: "Samarqand",
  samarkand: "Samarqand",
  самарканд: "Samarqand",
  buxoro: "Buxoro",
  bukhara: "Buxoro",
  бухара: "Buxoro",
  andijon: "Andijon",
  андижан: "Andijon",
  namangan: "Namangan",
  наманган: "Namangan",
};

function normalize(text: string) {
  return text.toLowerCase().replace(/['’ʻ`]/g, "'").trim();
}

export function detectCategoryHeuristic(text: string): { category: string; confidence: number } {
  const t = normalize(text);
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "rent") continue; // "rent" as a category is rarely the primary signal
    if (keywords.some((k) => t.includes(k))) {
      return { category, confidence: 0.8 };
    }
  }
  return { category: "apartment", confidence: 0.3 };
}

export function detectDealTypeHeuristic(text: string): "sale" | "rent" | null {
  const t = normalize(text);
  if (/(ijara|аренда|arenda|rent)/.test(t)) return "rent";
  if (/(sotiladi|sotuv|продажа|продаю|for sale|sale)/.test(t)) return "sale";
  return null;
}

export function normalizeLocationHeuristic(text: string): { city: string | null; district: string | null } {
  const t = normalize(text);
  let city: string | null = null;
  let district: string | null = null;

  for (const [alias, canonical] of Object.entries(CITY_ALIASES)) {
    if (t.includes(alias)) {
      city = canonical;
      break;
    }
  }
  if (!city) {
    city = CITIES.find((c) => t.includes(normalize(c))) ?? null;
  }

  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (t.includes(alias)) {
      district = canonical;
      break;
    }
  }
  if (!district) {
    district = DISTRICTS.find((d) => t.includes(normalize(d))) ?? null;
  }

  return { city, district };
}

export function generateKeywordsHeuristic(text: string, extra: { category?: string; city?: string | null; district?: string | null; rooms?: number } = {}): string[] {
  const t = normalize(text);
  const words = t
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  const uniq = Array.from(new Set(words)).slice(0, 8);

  const keywords = new Set<string>(uniq);
  if (extra.category) keywords.add(CATEGORY_META[extra.category]?.label.toLowerCase() ?? extra.category);
  if (extra.city) keywords.add(extra.city.toLowerCase());
  if (extra.district) keywords.add(extra.district.toLowerCase());
  if (extra.rooms) keywords.add(`${extra.rooms}-xonali`);
  return Array.from(keywords).slice(0, 12);
}

/**
 * Full "AI Understand" pipeline used by the /api/ai/understand route: category
 * detection + location normalization + keyword generation from free text.
 */
export async function understandListingText(text: string): Promise<UnderstandResult> {
  const heuristicCategory = detectCategoryHeuristic(text);
  const heuristicLocation = normalizeLocationHeuristic(text);
  const heuristicDealType = detectDealTypeHeuristic(text);
  const heuristicKeywords = generateKeywordsHeuristic(text, {
    category: heuristicCategory.category,
    city: heuristicLocation.city,
    district: heuristicLocation.district,
  });

  const completion = await safeComplete(
    [
      { role: "system", content: "You are a precise information-extraction engine for real-estate text. Always answer with strict JSON." },
      { role: "user", content: categoryDetectionPrompt(text) },
    ],
    { temperature: 0.1, maxTokens: 300, jsonMode: true }
  );

  if (completion) {
    const parsed = parseJsonSafely<{ category?: string; city?: string; district?: string; dealType?: string; confidence?: number }>(completion.text);
    if (parsed?.category) {
      return {
        category: parsed.category,
        city: parsed.city ?? heuristicLocation.city,
        district: parsed.district ?? heuristicLocation.district,
        dealType: (parsed.dealType as "sale" | "rent" | null) ?? heuristicDealType,
        keywords: generateKeywordsHeuristic(text, {
          category: parsed.category,
          city: parsed.city ?? heuristicLocation.city,
          district: parsed.district ?? heuristicLocation.district,
        }),
        confidence: parsed.confidence ?? 0.75,
        source: "ai",
      };
    }
  }

  return {
    category: heuristicCategory.category,
    city: heuristicLocation.city,
    district: heuristicLocation.district,
    dealType: heuristicDealType,
    keywords: heuristicKeywords,
    confidence: heuristicCategory.confidence,
    source: "heuristic",
  };
}
