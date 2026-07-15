/**
 * Lightweight natural-language search parser for Uzbek (and partly Russian)
 * real-estate queries. Converts free text such as
 *   "3 xona Chilonzor 600 mln gacha"
 * into structured filters without requiring any external AI API, so it
 * works fully offline and deterministically.
 */
export interface ParsedSearchFilters {
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  dealType?: "sale" | "rent" | "daily_rent" | "monthly_rent";
  propertyType?: string;
  districtKeyword?: string;
  regionKeyword?: string;
  keywords: string[];
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  kvartira: "apartment",
  xonadon: "apartment",
  uy: "house",
  hovli: "house",
  villa: "villa",
  kottej: "cottage",
  ofis: "office",
  dokon: "commercial",
  tijorat: "commercial",
  yer: "land",
  uchastka: "land",
  ombor: "warehouse",
  novostroyka: "new_building",
  "yangi qurilgan": "new_building",
};

const DEAL_TYPE_KEYWORDS: Array<{ keys: string[]; value: ParsedSearchFilters["dealType"] }> = [
  { keys: ["kunlik", "sutkalik"], value: "daily_rent" },
  { keys: ["oylik", "ijaraga", "ijara"], value: "monthly_rent" },
  { keys: ["sotiladi", "sotib", "sotilади", "sale"], value: "sale" },
];

function parsePriceToken(token: string): number | null {
  const cleaned = token.toLowerCase().replace(/,/g, "");
  const match = cleaned.match(/([\d.]+)\s*(mln|million|mlrd|milliard|ming|k)?/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) return null;
  const unit = match[2];
  if (unit === "mln" || unit === "million") return num * 1_000_000;
  if (unit === "mlrd" || unit === "milliard") return num * 1_000_000_000;
  if (unit === "ming" || unit === "k") return num * 1_000;
  return num;
}

export function parseNaturalLanguageQuery(rawQuery: string): ParsedSearchFilters {
  const query = rawQuery.trim().toLowerCase();
  const result: ParsedSearchFilters = { keywords: [] };

  const roomsMatch = query.match(/(\d+)\s*xona/);
  if (roomsMatch) result.rooms = parseInt(roomsMatch[1], 10);

  const areaMatch = query.match(/(\d+)\s*(m2|kv\.?m|kvadrat)/);
  if (areaMatch) result.minArea = parseInt(areaMatch[1], 10);

  const priceRangeMatch = query.match(
    /([\d.]+\s*(?:mln|million|mlrd|milliard|ming|k)?)\s*(?:dan|gacha|-)\s*([\d.]+\s*(?:mln|million|mlrd|milliard|ming|k)?)/,
  );
  if (priceRangeMatch) {
    const min = parsePriceToken(priceRangeMatch[1]);
    const max = parsePriceToken(priceRangeMatch[2]);
    if (min) result.minPrice = min;
    if (max) result.maxPrice = max;
  } else {
    const gachaMatch = query.match(/([\d.]+\s*(?:mln|million|mlrd|milliard|ming|k)?)\s*gacha/);
    if (gachaMatch) {
      const max = parsePriceToken(gachaMatch[1]);
      if (max) result.maxPrice = max;
    }
    const dansMatch = query.match(/([\d.]+\s*(?:mln|million|mlrd|milliard|ming|k)?)\s*dan\s*(?:qimmat|yuqori)/);
    if (dansMatch) {
      const min = parsePriceToken(dansMatch[1]);
      if (min) result.minPrice = min;
    }
  }

  for (const [key, code] of Object.entries(PROPERTY_TYPE_MAP)) {
    if (query.includes(key)) {
      result.propertyType = code;
      break;
    }
  }

  for (const entry of DEAL_TYPE_KEYWORDS) {
    if (entry.keys.some((k) => query.includes(k))) {
      result.dealType = entry.value;
      break;
    }
  }

  const knownWords = new Set([
    "xona",
    "gacha",
    "dan",
    "mln",
    "million",
    "mlrd",
    "milliard",
    "ming",
    "sotiladi",
    "ijaraga",
    "kunlik",
    "oylik",
    ...Object.keys(PROPERTY_TYPE_MAP),
  ]);

  const tokens = query
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    if (/^\d+$/.test(token)) continue;
    if (knownWords.has(token)) continue;
    result.keywords.push(token);
  }

  if (result.keywords.length > 0) {
    result.districtKeyword = result.keywords[0];
  }

  return result;
}
