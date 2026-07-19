/**
 * Sara Uylar — AI Recommendation Engine (Phase 6)
 * Personalized property recommendations based on user behavior
 */

import type { Property } from "@/types";
import type { UserTasteProfile, RecommendationResult, MatchScoreResult } from "./types";

/**
 * Build user taste profile from their favorites and viewed properties
 */
export function buildUserProfile(
  favorites: Property[],
  viewedProperties: Property[] = [],
  searchHistory: string[] = []
): UserTasteProfile {
  const categories: Record<string, number> = {};
  const cities: Record<string, number> = {};
  const districts: Record<string, number> = {};
  const amenitiesCount: Record<string, number> = {};
  
  let totalPrice = 0;
  let totalRooms = 0;
  let totalArea = 0;
  let priceMin = Infinity;
  let priceMax = 0;
  let count = 0;

  // Favorites have higher weight (3x)
  const processProperty = (p: Property, weight: number) => {
    categories[p.category] = (categories[p.category] ?? 0) + weight;
    cities[p.city] = (cities[p.city] ?? 0) + weight;
    districts[p.district] = (districts[p.district] ?? 0) + weight;
    
    totalPrice += p.price * weight;
    totalRooms += p.rooms * weight;
    totalArea += p.area * weight;
    count += weight;
    
    priceMin = Math.min(priceMin, p.price);
    priceMax = Math.max(priceMax, p.price);

    // Track amenities
    const amenities = p.amenities as Record<string, boolean> | undefined;
    if (amenities) {
      for (const [key, value] of Object.entries(amenities)) {
        if (value) {
          amenitiesCount[key] = (amenitiesCount[key] ?? 0) + weight;
        }
      }
    }
  };

  // Process favorites with 3x weight
  favorites.forEach(p => processProperty(p, 3));
  
  // Process viewed properties with 1x weight
  viewedProperties.forEach(p => processProperty(p, 1));

  // Extract preferred amenities (those mentioned in >30% of properties)
  const threshold = count * 0.3;
  const preferredAmenities = Object.entries(amenitiesCount)
    .filter(([, c]) => c >= threshold)
    .map(([k]) => k);

  return {
    userId: 0, // Will be set by caller
    categories,
    cities,
    districts,
    avgPrice: count > 0 ? totalPrice / count : null,
    avgRooms: count > 0 ? Math.round(totalRooms / count) : null,
    avgArea: count > 0 ? Math.round(totalArea / count) : null,
    priceRange: priceMin < Infinity ? { min: priceMin, max: priceMax } : null,
    preferredAmenities,
    searchHistory,
    viewedPropertyIds: viewedProperties.map(p => p.id),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate detailed match score with explanation
 */
export function calculateMatchScore(
  property: Property,
  profile: UserTasteProfile
): MatchScoreResult {
  const breakdown = {
    budget: 0,
    location: 0,
    size: 0,
    features: 0,
    history: 0,
  };
  const reasons: string[] = [];
  
  const totalWeight = Object.values(profile.categories).reduce((a, b) => a + b, 0);
  if (totalWeight === 0) {
    return {
      score: 50,
      breakdown: { budget: 50, location: 50, size: 50, features: 50, history: 50 },
      reasons: ["Sevimli e'lonlar qo'shing — shaxsiy tavsiyalar olasiz"],
      explanation: "Sizning xohishlaringiz hali aniqlanmagan",
    };
  }

  // Budget match (0-100)
  if (profile.avgPrice) {
    const priceDiff = Math.abs(property.price - profile.avgPrice) / profile.avgPrice;
    breakdown.budget = Math.round(Math.max(0, (1 - priceDiff) * 100));
    
    if (breakdown.budget >= 80) {
      reasons.push("💰 Byudjetingizga mos");
    } else if (property.price < (profile.priceRange?.min ?? 0)) {
      reasons.push("💰 Byudjetingizdan arzon");
    }
  } else {
    breakdown.budget = 50;
  }

  // Location match (0-100)
  const cityWeight = profile.cities[property.city] ?? 0;
  const districtWeight = profile.districts[property.district] ?? 0;
  const maxCityWeight = Math.max(1, ...Object.values(profile.cities));
  const maxDistrictWeight = Math.max(1, ...Object.values(profile.districts));
  
  breakdown.location = Math.round(
    (cityWeight / maxCityWeight * 50) + (districtWeight / maxDistrictWeight * 50)
  );
  
  if (cityWeight > 0) {
    reasons.push(`📍 ${property.city} — siz izlagan hudud`);
  }
  if (districtWeight > 0) {
    reasons.push(`📍 ${property.district} tumani yoqadi`);
  }

  // Size match (rooms & area)
  let sizeScore = 0;
  if (profile.avgRooms) {
    const roomsDiff = Math.abs(property.rooms - profile.avgRooms);
    sizeScore += Math.max(0, 1 - roomsDiff / 4) * 50;
    
    if (roomsDiff === 0) {
      reasons.push(`🏠 ${property.rooms} xonali — izlaganingizdek`);
    }
  } else {
    sizeScore += 25;
  }
  
  if (profile.avgArea) {
    const areaDiff = Math.abs(property.area - profile.avgArea) / profile.avgArea;
    sizeScore += Math.max(0, 1 - areaDiff) * 50;
    
    if (areaDiff < 0.15) {
      reasons.push(`📐 ${property.area} m² — mos maydon`);
    }
  } else {
    sizeScore += 25;
  }
  breakdown.size = Math.round(sizeScore);

  // Features match (amenities)
  const propertyAmenities = new Set(
    Object.entries(property.amenities as Record<string, boolean> || {})
      .filter(([, v]) => v)
      .map(([k]) => k)
  );
  const matchedAmenities = profile.preferredAmenities.filter(a => propertyAmenities.has(a));
  
  if (profile.preferredAmenities.length > 0) {
    breakdown.features = Math.round((matchedAmenities.length / profile.preferredAmenities.length) * 100);
    
    const amenityLabels: Record<string, string> = {
      parking: "Avtostoyanka",
      balcony: "Balkon",
      garden: "Hovli",
      pool: "Basseyn",
      security: "Qorovul",
      internet: "Internet",
      ac: "Konditsioner",
    };
    
    if (matchedAmenities.length > 0) {
      const labels = matchedAmenities.slice(0, 2).map(a => amenityLabels[a] || a);
      reasons.push(`✨ ${labels.join(", ")} mavjud`);
    }
  } else {
    breakdown.features = 50;
  }

  // Category match contributes to history score
  const categoryWeight = profile.categories[property.category] ?? 0;
  const maxCategoryWeight = Math.max(1, ...Object.values(profile.categories));
  breakdown.history = Math.round((categoryWeight / maxCategoryWeight) * 100);
  
  if (categoryWeight > 0) {
    const categoryLabels: Record<string, string> = {
      apartment: "Kvartira",
      house: "Uy",
      villa: "Villa",
      office: "Ofis",
      land: "Yer",
      rent: "Ijara",
    };
    reasons.push(`🏷️ ${categoryLabels[property.category] || property.category} — siz izlagan tur`);
  }

  // Calculate overall score (weighted average)
  const score = Math.round(
    breakdown.budget * 0.25 +
    breakdown.location * 0.25 +
    breakdown.size * 0.2 +
    breakdown.features * 0.15 +
    breakdown.history * 0.15
  );

  // Generate explanation
  let explanation: string;
  if (score >= 85) {
    explanation = "Ajoyib mos kelish! Bu sizning barcha mezonlaringizga javob beradi.";
  } else if (score >= 70) {
    explanation = "Yaxshi variant. Asosiy talablaringizga mos keladi.";
  } else if (score >= 50) {
    explanation = "O'rtacha mos kelish. Ba'zi jihatlari sizga mos.";
  } else {
    explanation = "Past mos kelish. Boshqa variantlarni ko'ring.";
  }

  return {
    score,
    breakdown,
    reasons: reasons.slice(0, 4), // Max 4 reasons
    explanation,
  };
}

/**
 * Generate personalized recommendations
 */
export function generateRecommendations(
  allProperties: Property[],
  favorites: Property[],
  viewedProperties: Property[] = [],
  limit = 10
): RecommendationResult[] {
  const favoriteIds = new Set(favorites.map(f => f.id));
  const viewedIds = new Set(viewedProperties.map(p => p.id));
  
  // Build profile
  const profile = buildUserProfile(favorites, viewedProperties);
  
  // Filter out already seen/favorited
  const candidates = allProperties.filter(p => 
    !favoriteIds.has(p.id) && p.status === "active"
  );

  // Score all candidates
  const scored: RecommendationResult[] = candidates.map(property => {
    const matchResult = calculateMatchScore(property, profile);
    
    // Determine recommendation type
    let type: RecommendationResult["type"] = "similar";
    
    if (property.isNew) {
      type = "new_listing";
    } else if (property.isVip || property.isPremium) {
      type = "trending";
    } else if (profile.avgPrice && property.price < profile.avgPrice * 0.85) {
      type = "budget_friendly";
    } else if (property.views > 100 && property.favoritesCount > 10) {
      type = "investment";
    }
    
    // Boost unseen properties slightly
    const seenBoost = viewedIds.has(property.id) ? 0 : 5;
    
    return {
      property,
      matchScore: Math.min(100, matchResult.score + seenBoost),
      reasons: matchResult.reasons,
      type,
    };
  });

  // Sort by match score
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Ensure diversity in recommendations
  const result: RecommendationResult[] = [];
  const usedCategories = new Set<string>();
  const usedCities = new Set<string>();
  
  for (const rec of scored) {
    if (result.length >= limit) break;
    
    // Allow some repetition but prefer diversity
    const categoryKey = rec.property.category;
    const cityKey = rec.property.city;
    
    // First 5: prioritize diversity
    if (result.length < 5) {
      if (usedCategories.has(categoryKey) && usedCities.has(cityKey) && result.length > 2) {
        continue;
      }
    }
    
    result.push(rec);
    usedCategories.add(categoryKey);
    usedCities.add(cityKey);
  }

  // If we don't have enough, fill with top scored
  while (result.length < limit && result.length < scored.length) {
    const next = scored.find(s => !result.includes(s));
    if (next) result.push(next);
    else break;
  }

  return result;
}

/**
 * Find similar properties to a given one
 */
export function findSimilarProperties(
  targetProperty: Property,
  allProperties: Property[],
  limit = 6
): Array<Property & { similarity: number }> {
  const similar = allProperties
    .filter(p => 
      p.id !== targetProperty.id &&
      p.status === "active"
    )
    .map(p => {
      let similarity = 0;
      
      // Same category: +30
      if (p.category === targetProperty.category) similarity += 30;
      
      // Same city: +20
      if (p.city === targetProperty.city) similarity += 20;
      
      // Same district: +15
      if (p.district === targetProperty.district) similarity += 15;
      
      // Similar price (within 30%): +20
      const priceDiff = Math.abs(p.price - targetProperty.price) / targetProperty.price;
      if (priceDiff < 0.3) similarity += Math.round((1 - priceDiff) * 20);
      
      // Similar rooms: +10
      if (Math.abs(p.rooms - targetProperty.rooms) <= 1) similarity += 10;
      
      // Similar area (within 20%): +10
      if (targetProperty.area > 0) {
        const areaDiff = Math.abs(p.area - targetProperty.area) / targetProperty.area;
        if (areaDiff < 0.2) similarity += Math.round((1 - areaDiff) * 10);
      }
      
      return { ...p, similarity };
    })
    .filter(p => p.similarity > 30)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return similar;
}

/**
 * Get "Continue Browsing" suggestions based on recent views
 */
export function getContinueBrowsing(
  viewedProperties: Property[],
  allProperties: Property[],
  limit = 4
): Property[] {
  if (viewedProperties.length === 0) return [];
  
  const viewedIds = new Set(viewedProperties.map(p => p.id));
  
  // Use most recent viewed properties to find similar ones
  const recent = viewedProperties.slice(-3);
  const similar: Property[] = [];
  
  for (const viewed of recent) {
    const matches = findSimilarProperties(viewed, allProperties, 2);
    for (const match of matches) {
      if (!viewedIds.has(match.id) && !similar.find(s => s.id === match.id)) {
        similar.push(match);
      }
    }
    if (similar.length >= limit) break;
  }
  
  return similar.slice(0, limit);
}
