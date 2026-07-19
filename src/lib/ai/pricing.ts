/**
 * Sara Uylar — AI Price Advisor Service (Phase 6)
 * Advanced price analysis with market comparison and demand estimation
 */

import type { Property } from "@/types";
import type { PriceAdviceInput, PriceAdviceResult } from "./types";

// Price adjustment factors based on property conditions
const CONDITION_MULTIPLIERS: Record<string, number> = {
  euro: 1.15,
  excellent: 1.10,
  good: 1.0,
  average: 0.92,
  needs_repair: 0.80,
  rough: 0.70,
};

// Floor preference multipliers (middle floors are most desirable)
function getFloorMultiplier(floor: number, totalFloors: number): number {
  if (totalFloors <= 1) return 1;
  
  // Ground floor slightly less desirable
  if (floor === 1) return 0.95;
  
  // Top floor slightly less (roof heat/leaks)
  if (floor === totalFloors) return 0.97;
  
  // Middle floors most desirable
  const middle = totalFloors / 2;
  const distanceFromMiddle = Math.abs(floor - middle) / middle;
  return 1 + (0.05 * (1 - distanceFromMiddle));
}

// Age factor (newer buildings command premium)
function getAgeFactor(yearBuilt: number | undefined): number {
  if (!yearBuilt) return 1;
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearBuilt;
  
  if (age <= 2) return 1.12; // New construction
  if (age <= 5) return 1.08;
  if (age <= 10) return 1.04;
  if (age <= 20) return 1.0;
  if (age <= 40) return 0.95;
  return 0.88; // Old Soviet buildings
}

// Calculate demand level based on views and favorites
function estimateDemand(comparables: Property[]): "low" | "medium" | "high" {
  if (comparables.length === 0) return "medium";
  
  const avgViews = comparables.reduce((sum, p) => sum + p.views, 0) / comparables.length;
  const avgFavorites = comparables.reduce((sum, p) => sum + p.favoritesCount, 0) / comparables.length;
  
  const demandScore = avgViews * 0.3 + avgFavorites * 5;
  
  if (demandScore > 100) return "high";
  if (demandScore > 30) return "medium";
  return "low";
}

// Estimate days to sell based on similar listings
function estimateSellingDays(comparables: Property[], pricePosition: "below" | "fair" | "above"): number {
  const baseDays = 45; // Average days to sell
  
  const demand = estimateDemand(comparables);
  
  let multiplier = 1;
  
  // Adjust for demand
  if (demand === "high") multiplier *= 0.7;
  else if (demand === "low") multiplier *= 1.4;
  
  // Adjust for price position
  if (pricePosition === "below") multiplier *= 0.6;
  else if (pricePosition === "above") multiplier *= 1.5;
  
  return Math.round(baseDays * multiplier);
}

// Determine price position relative to market
function determineMarketPosition(price: number, fairPrice: number): "below" | "fair" | "above" {
  const ratio = price / fairPrice;
  
  if (ratio < 0.92) return "below";
  if (ratio > 1.08) return "above";
  return "fair";
}

/**
 * Compute comprehensive price advice based on comparable listings
 */
export function computeAdvancedPriceAdvice(
  comparables: Property[],
  input: PriceAdviceInput
): PriceAdviceResult | null {
  if (comparables.length === 0) {
    return null;
  }

  // Calculate price per square meter for properties with area data
  const pricesPerSqm = comparables
    .filter(c => c.area > 0)
    .map(c => c.price / c.area);
  
  let basePricePerSqm: number;
  let fairPrice: number;
  
  if (pricesPerSqm.length >= 3 && input.area) {
    // Use median price per sqm
    pricesPerSqm.sort((a, b) => a - b);
    basePricePerSqm = pricesPerSqm[Math.floor(pricesPerSqm.length / 2)];
    fairPrice = basePricePerSqm * input.area;
  } else {
    // Fallback to median total price
    const prices = comparables.map(c => c.price).sort((a, b) => a - b);
    fairPrice = prices[Math.floor(prices.length / 2)];
    basePricePerSqm = input.area ? fairPrice / input.area : 0;
  }

  // Apply adjustment factors
  let adjustedPrice = fairPrice;

  // Condition adjustment
  if (input.condition) {
    const conditionMultiplier = CONDITION_MULTIPLIERS[input.condition] ?? 1;
    adjustedPrice *= conditionMultiplier;
  }

  // Floor adjustment
  if (input.floor && input.totalFloors) {
    adjustedPrice *= getFloorMultiplier(input.floor, input.totalFloors);
  }

  // Age adjustment
  adjustedPrice *= getAgeFactor(input.yearBuilt);

  // Room adjustment (more rooms = slight premium)
  if (input.rooms) {
    const avgRooms = comparables.reduce((sum, c) => sum + c.rooms, 0) / comparables.length;
    const roomsDiff = input.rooms - avgRooms;
    adjustedPrice *= 1 + (roomsDiff * 0.03);
  }

  // Calculate price range
  const low = Math.round(adjustedPrice * 0.88);
  const high = Math.round(adjustedPrice * 1.15);
  const fair = Math.round(adjustedPrice);

  // Determine confidence
  const confidence: "low" | "medium" | "high" = 
    comparables.length >= 10 ? "high" :
    comparables.length >= 5 ? "medium" : "low";

  // Market comparison (assuming seller's price is fair for now)
  const marketComparison = determineMarketPosition(fair, fair);

  // Estimate demand and selling time
  const demand = estimateDemand(comparables);
  const sellingDays = estimateSellingDays(comparables, marketComparison);

  // Get similar listings for reference
  const similarListings = comparables
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      area: p.area,
      rooms: p.rooms,
    }));

  return {
    low,
    fair,
    high,
    currency: comparables[0]?.currency ?? "USD",
    sampleSize: comparables.length,
    confidence,
    pricePerSqm: Math.round(basePricePerSqm),
    marketComparison,
    estimatedDemand: demand,
    estimatedSellingDays: sellingDays,
    similarListings,
  };
}

/**
 * Generate price warning messages for sellers
 */
export function getPriceWarnings(
  askingPrice: number,
  advice: PriceAdviceResult
): Array<{ type: "too_high" | "too_low" | "good"; message: string }> {
  const warnings: Array<{ type: "too_high" | "too_low" | "good"; message: string }> = [];
  
  const ratio = askingPrice / advice.fair;
  
  if (ratio > 1.20) {
    warnings.push({
      type: "too_high",
      message: `Narx bozor o'rtachasidan ${Math.round((ratio - 1) * 100)}% yuqori. Bu sotish muddatini uzaytirishi mumkin.`,
    });
  } else if (ratio > 1.08) {
    warnings.push({
      type: "too_high",
      message: "Narx bozor o'rtachasidan biroz yuqori. Savdolashuvga tayyor bo'ling.",
    });
  } else if (ratio < 0.85) {
    warnings.push({
      type: "too_low",
      message: `Narx bozor o'rtachasidan ${Math.round((1 - ratio) * 100)}% past. Tezroq sotilishi mumkin, lekin daromadni yo'qotasiz.`,
    });
  } else if (ratio < 0.92) {
    warnings.push({
      type: "too_low",
      message: "Narx bozor o'rtachasidan past — bu tezroq sotishga yordam beradi.",
    });
  } else {
    warnings.push({
      type: "good",
      message: "Narx bozor o'rtachasiga mos. Optimal tanlov!",
    });
  }
  
  return warnings;
}

/**
 * Calculate investment potential score
 */
export function calculateInvestmentScore(
  property: Property,
  marketData: { avgPriceGrowth: number; avgRentalYield: number }
): {
  score: number;
  roi: number;
  recommendation: string;
  factors: Array<{ factor: string; impact: "positive" | "negative" | "neutral" }>;
} {
  let score = 50; // Base score
  const factors: Array<{ factor: string; impact: "positive" | "negative" | "neutral" }> = [];
  
  // Price growth factor
  if (marketData.avgPriceGrowth > 10) {
    score += 20;
    factors.push({ factor: "Yuqori narx o'sishi", impact: "positive" });
  } else if (marketData.avgPriceGrowth > 5) {
    score += 10;
    factors.push({ factor: "O'rtacha narx o'sishi", impact: "positive" });
  } else {
    factors.push({ factor: "Past narx o'sishi", impact: "negative" });
  }
  
  // Location factor
  if (property.isVip || property.isPremium) {
    score += 10;
    factors.push({ factor: "Premium joylashuv", impact: "positive" });
  }
  
  // Property age
  if (property.yearBuilt && property.yearBuilt >= new Date().getFullYear() - 5) {
    score += 15;
    factors.push({ factor: "Yangi qurilish", impact: "positive" });
  }
  
  // Demand factor
  if (property.views > 100 || property.favoritesCount > 20) {
    score += 10;
    factors.push({ factor: "Yuqori talab", impact: "positive" });
  }
  
  // Calculate estimated ROI
  const roi = marketData.avgPriceGrowth + marketData.avgRentalYield;
  
  // Generate recommendation
  let recommendation: string;
  if (score >= 75) {
    recommendation = "Yaxshi investitsiya imkoniyati. Sotib olishni tavsiya etamiz.";
  } else if (score >= 50) {
    recommendation = "O'rtacha investitsiya. Batafsil tahlil qiling.";
  } else {
    recommendation = "Xavfli investitsiya. Ehtiyot bo'ling.";
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    roi: Math.round(roi * 10) / 10,
    recommendation,
    factors,
  };
}
