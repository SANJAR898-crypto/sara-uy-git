/**
 * AI Memory (Phase 9)
 *
 * Remembers what a signed-in buyer has viewed and favorited to build a
 * richer taste profile than favorites alone, feeding the AI Recommendation
 * Engine and letting every recommendation carry a short, honest "why" so it
 * feels like real advice instead of a black-box ranking.
 */
import { db } from "@/db";
import { properties, propertyEvents, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { buildTasteProfile, type TasteProfile } from "@/lib/ai";
import { mapProperty } from "@/lib/mappers";
import type { Property } from "@/types";

/** Fetches the properties a user has recently viewed (most recent first, deduplicated). */
export async function getRecentlyViewedProperties(userId: number, limit = 20): Promise<Property[]> {
  const rows = await db
    .select({ property: properties, seller: users, viewedAt: propertyEvents.createdAt })
    .from(propertyEvents)
    .innerJoin(properties, eq(propertyEvents.propertyId, properties.id))
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(eq(propertyEvents.viewerId, userId))
    .orderBy(desc(propertyEvents.createdAt))
    .limit(limit * 3); // over-fetch to allow de-duplication below

  const seen = new Set<number>();
  const result: Property[] = [];
  for (const row of rows) {
    if (seen.has(row.property.id)) continue;
    seen.add(row.property.id);
    result.push(mapProperty(row.property, row.seller));
    if (result.length >= limit) break;
  }
  return result;
}

/**
 * Builds a blended taste profile from both explicit favorites (strong
 * signal) and recently viewed listings (weaker but still meaningful signal)
 * — the "AI Memory" behind personalised recommendations.
 */
export async function buildMemoryProfile(userId: number, favorites: Property[]): Promise<{ profile: TasteProfile; recentlyViewed: Property[] }> {
  const recentlyViewed = await getRecentlyViewedProperties(userId, 20);
  // Favorites count twice as much as a view by including them one extra time.
  const blended = [...favorites, ...favorites, ...recentlyViewed];
  const profile = buildTasteProfile(blended);
  return { profile, recentlyViewed };
}

/** Produces a short, human-readable explanation of why a listing was recommended. */
export function explainRecommendation(property: Property, profile: TasteProfile, recentlyViewed: Property[]): string {
  const reasons: string[] = [];
  const totalWeight = Object.values(profile.categories).reduce((a, b) => a + b, 0);

  if (totalWeight === 0) {
    return "Platformadagi eng mashhur va tekshirilgan e'lonlardan biri sifatida tavsiya qilindi.";
  }

  const categoryShare = (profile.categories[property.category] ?? 0) / totalWeight;
  if (categoryShare > 0.3) reasons.push(`ko'rgan/saqlagan e'lonlaringiz ko'pincha "${property.category}" turida`);

  const citySharePct = (profile.cities[property.city] ?? 0) / totalWeight;
  if (citySharePct > 0.3) reasons.push(`${property.city} shahriga qiziqishingiz aniqlandi`);

  if (profile.avgPrice != null) {
    const diff = Math.abs(property.price - profile.avgPrice) / profile.avgPrice;
    if (diff < 0.25) reasons.push("narxi sizning odatiy byudjetingizga mos");
  }

  if (recentlyViewed.some((v) => v.district === property.district)) {
    reasons.push(`${property.district} hududidagi e'lonlarni avval ko'rgansiz`);
  }

  if (reasons.length === 0) {
    return "Sizning afzalliklaringizga umumiy mosligi asosida tavsiya qilindi.";
  }
  return `Tavsiya sababi: ${reasons.join(", ")}.`;
}
