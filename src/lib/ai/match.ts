/**
 * AI Match Score — detailed breakdown version.
 *
 * Wraps the existing lightweight `matchScore()` heuristic (kept for list
 * ranking performance) with a richer, explainable breakdown used on the
 * property detail page and the `/api/ai/match-score` endpoint: budget,
 * location, rooms and amenities match components plus an overall %.
 */
import { buildTasteProfile, type TasteProfile } from "@/lib/ai";
import type { Property } from "@/types";

export interface MatchBreakdown {
  overall: number; // 0-100
  budgetMatch: number; // 0-100
  locationMatch: number; // 0-100
  roomsMatch: number; // 0-100
  amenitiesMatch: number; // 0-100
  distanceMatch: number; // 0-100
  explanation: string;
}

function amenitiesOverlap(target: Property, profileFavorites: Property[]): number {
  if (profileFavorites.length === 0) return 60; // neutral-positive default
  const favoriteAmenityCounts: Record<string, number> = {};
  let total = 0;
  for (const fav of profileFavorites) {
    for (const [key, value] of Object.entries(fav.amenities || {})) {
      if (value) {
        favoriteAmenityCounts[key] = (favoriteAmenityCounts[key] ?? 0) + 1;
        total++;
      }
    }
  }
  if (total === 0) return 60;

  const targetAmenities = Object.entries(target.amenities || {})
    .filter(([, v]) => v)
    .map(([k]) => k);
  if (targetAmenities.length === 0) return 40;

  const matched = targetAmenities.filter((a) => favoriteAmenityCounts[a]);
  return Math.round((matched.length / targetAmenities.length) * 100);
}

function distanceProxyScore(target: Property, profileFavorites: Property[]): number {
  // Without real coordinates for the user's "home base" we approximate
  // "distance match" by how often the buyer favorited listings in the same
  // city/district — a reasonable, dependency-free proxy that still respects
  // the "distance match" concept requested for AI Match Score.
  if (profileFavorites.length === 0) return 55;
  const sameCity = profileFavorites.filter((f) => f.city === target.city).length;
  const sameDistrict = profileFavorites.filter((f) => f.district === target.district).length;
  const score = (sameCity / profileFavorites.length) * 50 + (sameDistrict / profileFavorites.length) * 50;
  return Math.round(Math.min(100, score + 20));
}

export function computeDetailedMatch(property: Property, favorites: Property[]): MatchBreakdown {
  const profile: TasteProfile = buildTasteProfile(favorites);
  const totalFavs = Object.values(profile.categories).reduce((a, b) => a + b, 0);

  let budgetMatch = 65;
  if (profile.avgPrice != null && profile.avgPrice > 0) {
    const diff = Math.abs(property.price - profile.avgPrice) / profile.avgPrice;
    budgetMatch = Math.round(Math.max(0, 1 - diff) * 100);
  }

  let locationMatch = 55;
  if (totalFavs > 0) {
    const cityWeight = (profile.cities[property.city] ?? 0) / totalFavs;
    locationMatch = Math.round(Math.min(100, cityWeight * 100 + 25));
  }

  let roomsMatch = 60;
  if (profile.avgRooms != null) {
    const diff = Math.abs(property.rooms - profile.avgRooms);
    roomsMatch = Math.round(Math.max(0, 1 - diff / 4) * 100);
  }

  const amenitiesMatch = amenitiesOverlap(property, favorites);
  const distanceMatch = distanceProxyScore(property, favorites);

  const overall = Math.round(
    budgetMatch * 0.3 + locationMatch * 0.25 + roomsMatch * 0.2 + amenitiesMatch * 0.15 + distanceMatch * 0.1
  );

  const strongest = Object.entries({ budgetMatch, locationMatch, roomsMatch, amenitiesMatch, distanceMatch }).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const labelMap: Record<string, string> = {
    budgetMatch: "byudjetingizga",
    locationMatch: "afzal ko'rgan hududingizga",
    roomsMatch: "xonalar soni bo'yicha talabingizga",
    amenitiesMatch: "yoqtirgan qulayliklaringizga",
    distanceMatch: "odatiy joylashuvingizga",
  };

  return {
    overall: Math.max(5, Math.min(100, overall)),
    budgetMatch,
    locationMatch,
    roomsMatch,
    amenitiesMatch,
    distanceMatch,
    explanation: `Bu e'lon ${overall}% mos — asosan ${labelMap[strongest[0]] ?? "afzalliklaringizga"} yaqin.`,
  };
}
