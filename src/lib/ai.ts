/**
 * Sara Uylar — lightweight, dependency-free "AI" heuristics engine.
 *
 * These utilities power AI Search ranking, AI Match Score, AI Price Advisor,
 * AI Image Verification and the AI Recommendation Engine without requiring
 * any external paid API. If `OPENAI_API_KEY` is configured in the
 * environment, `smartRelevance` will additionally be able to be extended
 * server-side, but the platform stays fully functional offline.
 */
import type { Property } from "@/types";

/* ============================================================
   Text relevance scoring (AI Search)
   ============================================================ */
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string) {
  return normalize(text).split(" ").filter(Boolean);
}

/** Simple token-overlap + substring relevance score between 0 and 1. */
export function textRelevance(query: string, haystack: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const h = normalize(haystack);
  if (!h) return 0;

  let score = 0;
  if (h.includes(q)) score += 0.6;

  const qTokens = tokenize(query);
  const hTokens = new Set(tokenize(haystack));
  if (qTokens.length) {
    const matched = qTokens.filter((t) => hTokens.has(t) || [...hTokens].some((ht) => ht.startsWith(t) || t.startsWith(ht)));
    score += (matched.length / qTokens.length) * 0.4;
  }
  return Math.min(1, score);
}

export interface SmartRankOptions {
  query?: string | null;
  boostVip?: boolean;
}

/**
 * Reranks a list of properties combining text relevance, recency, view
 * popularity and VIP/verified boosts — the core of the "AI Search" feature.
 */
export function smartRankProperties(properties: Property[], options: SmartRankOptions = {}): Property[] {
  const { query, boostVip = true } = options;
  const maxViews = Math.max(1, ...properties.map((p) => p.views));

  const scored = properties.map((p) => {
    let score = 0;
    if (query && query.trim()) {
      const haystack = `${p.title} ${p.description} ${p.district} ${p.city} ${p.category}`;
      score += textRelevance(query, haystack) * 100;
    }
    score += (p.views / maxViews) * 12;
    if (p.isVip && boostVip) score += 10;
    if (p.isVerified) score += 5;
    if (p.isNew) score += 3;
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.p);
}

/* ============================================================
   AI Match Score — how well a listing fits a user's taste profile
   ============================================================ */
export interface TasteProfile {
  categories: Record<string, number>;
  cities: Record<string, number>;
  avgPrice: number | null;
  avgRooms: number | null;
}

export function buildTasteProfile(favorites: Property[]): TasteProfile {
  const categories: Record<string, number> = {};
  const cities: Record<string, number> = {};
  let priceSum = 0;
  let roomsSum = 0;

  for (const f of favorites) {
    categories[f.category] = (categories[f.category] ?? 0) + 1;
    cities[f.city] = (cities[f.city] ?? 0) + 1;
    priceSum += f.price;
    roomsSum += f.rooms;
  }

  return {
    categories,
    cities,
    avgPrice: favorites.length ? priceSum / favorites.length : null,
    avgRooms: favorites.length ? roomsSum / favorites.length : null,
  };
}

/** Returns a 0-100 "match score" describing how well a property fits a taste profile. */
export function matchScore(property: Property, profile: TasteProfile): number {
  const totalFavs = Object.values(profile.categories).reduce((a, b) => a + b, 0);
  if (totalFavs === 0) return 50; // neutral baseline for brand-new users

  let score = 0;
  const categoryWeight = (profile.categories[property.category] ?? 0) / totalFavs;
  score += categoryWeight * 45;

  const cityWeight = (profile.cities[property.city] ?? 0) / totalFavs;
  score += cityWeight * 20;

  if (profile.avgPrice != null && profile.avgPrice > 0) {
    const diff = Math.abs(property.price - profile.avgPrice) / profile.avgPrice;
    score += Math.max(0, 1 - diff) * 20;
  } else {
    score += 10;
  }

  if (profile.avgRooms != null) {
    const diff = Math.abs(property.rooms - profile.avgRooms);
    score += Math.max(0, 1 - diff / 4) * 15;
  } else {
    score += 7;
  }

  return Math.round(Math.min(100, Math.max(5, score)));
}

/* ============================================================
   AI Price Advisor
   ============================================================ */
export interface PriceAdviceResult {
  low: number;
  fair: number;
  high: number;
  sampleSize: number;
  currency: string;
  confidence: "low" | "medium" | "high";
}

export function computePriceAdvice(
  comparables: Property[],
  target: { area?: number | null; rooms?: number | null }
): PriceAdviceResult | null {
  if (comparables.length === 0) return null;

  // Prefer $/m² pricing when area data is available for better precision.
  const perSqm = comparables.filter((c) => c.area > 0).map((c) => c.price / c.area);

  let fair: number;
  if (perSqm.length >= 3 && target.area) {
    perSqm.sort((a, b) => a - b);
    const median = perSqm[Math.floor(perSqm.length / 2)];
    fair = median * target.area;
  } else {
    const prices = comparables.map((c) => c.price).sort((a, b) => a - b);
    fair = prices[Math.floor(prices.length / 2)];
  }

  const low = Math.round(fair * 0.88);
  const high = Math.round(fair * 1.15);
  const confidence = comparables.length >= 8 ? "high" : comparables.length >= 3 ? "medium" : "low";

  return {
    low,
    fair: Math.round(fair),
    high,
    sampleSize: comparables.length,
    currency: comparables[0]?.currency ?? "USD",
    confidence,
  };
}

/* ============================================================
   AI Image Verification (heuristic, no external vision model needed)
   ============================================================ */
export interface ImageVerificationResult {
  verified: boolean;
  confidence: number; // 0-100
  notes: string[];
}

const TRUSTED_IMAGE_HOSTS = ["images.pexels.com", "i.pravatar.cc", "images.unsplash.com", "telegram.org", "t.me"];

export function verifyImagesHeuristic(images: string[]): ImageVerificationResult {
  const notes: string[] = [];
  if (!images || images.length === 0) {
    return { verified: false, confidence: 0, notes: ["Rasm biriktirilmagan"] };
  }

  let goodCount = 0;
  const seen = new Set<string>();
  for (const raw of images) {
    if (seen.has(raw)) {
      notes.push("Takroriy rasm aniqlandi");
      continue;
    }
    seen.add(raw);

    const isLocal = raw.startsWith("/");
    let isHttps = false;
    let trustedHost = false;
    let looksLikeImage = /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(raw);

    if (!isLocal) {
      try {
        const url = new URL(raw);
        isHttps = url.protocol === "https:";
        trustedHost = TRUSTED_IMAGE_HOSTS.some((h) => url.hostname.endsWith(h));
        if (url.hostname.includes("pexels.com") || url.hostname.includes("unsplash.com")) looksLikeImage = true;
      } catch {
        notes.push(`Yaroqsiz URL: ${raw.slice(0, 40)}`);
        continue;
      }
    } else {
      isHttps = true;
      looksLikeImage = true;
    }

    if ((isHttps && (trustedHost || looksLikeImage)) || isLocal) {
      goodCount++;
    } else {
      notes.push("Rasm manbasi ishonchli emas");
    }
  }

  const confidence = Math.round((goodCount / images.length) * 100);
  const verified = confidence >= 70;
  if (verified) notes.unshift(`${goodCount}/${images.length} rasm sifat mezonlaridan o'tdi`);

  return { verified, confidence, notes };
}

/* ============================================================
   AI Recommendation Engine
   ============================================================ */
export function recommendProperties(
  allActive: Property[],
  favorites: Property[],
  limit = 10
): Array<Property & { matchScore: number }> {
  const favoriteIds = new Set(favorites.map((f) => f.id));
  const profile = buildTasteProfile(favorites);
  const candidates = allActive.filter((p) => !favoriteIds.has(p.id));

  const scored = candidates.map((p) => ({ ...p, matchScore: matchScore(p, profile) }));
  scored.sort((a, b) => b.matchScore - a.matchScore || b.views - a.views);
  return scored.slice(0, limit);
}
