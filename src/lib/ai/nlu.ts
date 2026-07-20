/**
 * AI Buyer Assistant — Natural Language Search (NLU)
 *
 * Parses free-form Uzbek/Russian/English queries like:
 *   "Toshkentda 3 xonali 100 ming dollargacha"
 *   "Yangi qurilgan hovli"
 *   "Universitetga yaqin kvartira"
 * into structured property filters. Runs on fast regex heuristics (works
 * fully offline) and is optionally refined by a real LLM when configured.
 */
import { CITIES, DISTRICTS } from "@/lib/constants";
import { detectCategoryHeuristic, normalizeLocationHeuristic } from "@/lib/ai/understand";
import { nluSearchPrompt } from "@/lib/ai/prompts";
import { parseJsonSafely, safeComplete } from "@/lib/ai/provider";

export interface ParsedSearchFilters {
  category: string | null;
  dealType: "sale" | "rent" | null;
  city: string | null;
  district: string | null;
  minRooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: "USD" | "UZS" | null;
  keywords: string[];
  nearPlace: string | null;
  source: "heuristic" | "ai";
  explanation: string;
}

const NEAR_PLACE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /universitet(ga|dan)?|институт|university/i, label: "universitet" },
  { pattern: /metro|метро/i, label: "metro" },
  { pattern: /maktab|школ[аы]|school/i, label: "maktab" },
  { pattern: /bozor|bozorga|рынок|market/i, label: "bozor" },
  { pattern: /shifoxona|kasalxona|больниц|hospital/i, label: "shifoxona" },
  { pattern: /parkga|park|парк/i, label: "park" },
];

function parseRooms(query: string): number | null {
  const m = query.match(/(\d+)\s*(xonali|xona|комнат|room)/i);
  if (m) return Number(m[1]);
  return null;
}

/** Parses Uzbek/Russian shorthand money expressions: "100 ming dollar", "50000 dollargacha", "2 million so'm". */
function parsePrice(query: string): { minPrice: number | null; maxPrice: number | null; currency: "USD" | "UZS" | null } {
  const lower = query.toLowerCase();
  let currency: "USD" | "UZS" | null = null;
  if (/(dollar|доллар|\$|usd)/.test(lower)) currency = "USD";
  else if (/(so'm|som|сум|uzs)/.test(lower)) currency = "UZS";

  // number [ming|million|mln] ... [gacha|dan kam|дешевле]
  const numMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(ming|million|mln|тыс|млн)?/);
  let value: number | null = null;
  if (numMatch) {
    const raw = Number(numMatch[1].replace(",", "."));
    const unit = numMatch[2];
    if (unit && /(ming|тыс)/.test(unit)) value = raw * 1_000;
    else if (unit && /(million|mln|млн)/.test(unit)) value = raw * 1_000_000;
    else if (raw > 200) value = raw; // treat bare large numbers as absolute price
  }

  if (value == null) return { minPrice: null, maxPrice: null, currency };

  const isMax = /(gacha|kam|arzon|below|under|дешевле|до )/.test(lower);
  if (isMax) return { minPrice: null, maxPrice: value, currency };
  const isMin = /(dan yuqori|dan qimmat|ortiq|above|over|дороже|от )/.test(lower);
  if (isMin) return { minPrice: value, maxPrice: null, currency };
  // Default: treat as a budget ceiling — the most common buyer intent.
  return { minPrice: null, maxPrice: value, currency };
}

function parseDealType(query: string): "sale" | "rent" | null {
  const lower = query.toLowerCase();
  if (/(ijara|аренда|arenda|rent)/.test(lower)) return "rent";
  if (/(sotib olish|sotuv|sotiladi|продажа|buy|for sale)/.test(lower)) return "sale";
  return null;
}

function parseNearPlace(query: string): string | null {
  for (const { pattern, label } of NEAR_PLACE_PATTERNS) {
    if (pattern.test(query)) return label;
  }
  if (/yaqin|рядом|near|walking distance/i.test(query)) return "yaqin atrofda";
  return null;
}

export function parseSearchHeuristic(query: string): ParsedSearchFilters {
  const { category } = detectCategoryHeuristic(query);
  const { city, district } = normalizeLocationHeuristic(query);
  const dealType = parseDealType(query);
  const minRooms = parseRooms(query);
  const { minPrice, maxPrice, currency } = parsePrice(query);
  const nearPlace = parseNearPlace(query);

  const explanationParts: string[] = [];
  if (city) explanationParts.push(city);
  if (district) explanationParts.push(district);
  if (minRooms) explanationParts.push(`${minRooms}+ xona`);
  if (maxPrice) explanationParts.push(`${maxPrice.toLocaleString()} ${currency ?? "USD"} gacha`);
  if (nearPlace) explanationParts.push(`${nearPlace} yaqinida`);
  if (dealType === "rent") explanationParts.push("ijaraga");

  return {
    category: /kvartira|uy|villa|ofis|yer|hovli/i.test(query) || category !== "apartment" ? category : (CITIES.length ? category : null),
    dealType,
    city,
    district,
    minRooms,
    minPrice,
    maxPrice,
    currency,
    keywords: query
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4),
    nearPlace,
    source: "heuristic",
    explanation: explanationParts.length ? `AI qidiruv: ${explanationParts.join(", ")}` : "AI qidiruv: umumiy natijalar",
  };
}

/** Full pipeline: heuristic parse, optionally refined/corrected by a real LLM. */
export async function parseNaturalLanguageQuery(query: string): Promise<ParsedSearchFilters> {
  const heuristic = parseSearchHeuristic(query);

  const completion = await safeComplete(
    [
      { role: "system", content: "You extract structured real-estate search filters from natural language. Always respond with strict JSON, no commentary." },
      { role: "user", content: nluSearchPrompt(query) },
    ],
    { temperature: 0.1, maxTokens: 300, jsonMode: true }
  );

  if (!completion) return heuristic;

  const parsed = parseJsonSafely<Partial<ParsedSearchFilters>>(completion.text);
  if (!parsed) return heuristic;

  return {
    category: parsed.category ?? heuristic.category,
    dealType: (parsed.dealType as "sale" | "rent" | null) ?? heuristic.dealType,
    city: parsed.city ?? heuristic.city,
    district: parsed.district ?? heuristic.district,
    minRooms: parsed.minRooms ?? heuristic.minRooms,
    minPrice: parsed.minPrice ?? heuristic.minPrice,
    maxPrice: parsed.maxPrice ?? heuristic.maxPrice,
    currency: (parsed.currency as "USD" | "UZS" | null) ?? heuristic.currency,
    keywords: parsed.keywords?.length ? parsed.keywords : heuristic.keywords,
    nearPlace: parsed.nearPlace ?? heuristic.nearPlace,
    source: "ai",
    explanation: heuristic.explanation,
  };
}

// Re-exported for API routes that want the known gazetteer for validation/autocomplete.
export const KNOWN_DISTRICTS = DISTRICTS;
export const KNOWN_CITIES = CITIES;
