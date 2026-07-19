/**
 * Sara Uylar — AI Market Analytics Service (Phase 6)
 * Price trends, district heatmaps, and investment analysis
 */

import type { Property } from "@/types";
import type { MarketAnalytics } from "./types";

/**
 * Calculate average price by category/district/etc.
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate median price
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Group properties by a key function
 */
function groupBy<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/**
 * Calculate price trends over time periods
 */
export function calculatePriceTrends(
  properties: Property[],
  periods = 6
): MarketAnalytics["priceTrends"] {
  const trends: MarketAnalytics["priceTrends"] = [];
  
  const now = new Date();
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];
  
  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const periodProperties = properties.filter(p => {
      const created = new Date(p.createdAt);
      return created >= date && created <= endDate;
    });
    
    const prices = periodProperties.map(p => p.price);
    const avgPrice = calculateAverage(prices);
    const medianPrice = calculateMedian(prices);
    
    // Calculate change from previous period
    let priceChange = 0;
    if (trends.length > 0) {
      const prevAvg = trends[trends.length - 1].avgPrice;
      if (prevAvg > 0) {
        priceChange = ((avgPrice - prevAvg) / prevAvg) * 100;
      }
    }
    
    trends.push({
      period: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      avgPrice: Math.round(avgPrice),
      medianPrice: Math.round(medianPrice),
      priceChange: Math.round(priceChange * 10) / 10,
    });
  }
  
  return trends;
}

/**
 * Generate district heatmap data
 */
export function calculateDistrictHeatmap(
  properties: Property[]
): MarketAnalytics["districtHeatmap"] {
  const byDistrict = groupBy(properties, p => `${p.city}__${p.district}`);
  
  return Object.entries(byDistrict).map(([key, props]) => {
    const [city, district] = key.split("__");
    const prices = props.map(p => p.price);
    const avgPrice = calculateAverage(prices);
    
    // Calculate demand score based on views and favorites
    const totalViews = props.reduce((sum, p) => sum + p.views, 0);
    const totalFavorites = props.reduce((sum, p) => sum + p.favoritesCount, 0);
    const demandScore = Math.min(100, Math.round(
      (totalViews / Math.max(1, props.length)) * 0.3 +
      (totalFavorites / Math.max(1, props.length)) * 3
    ));
    
    // Estimate price growth (simplified - would need historical data)
    const newListings = props.filter(p => p.isNew).length;
    const priceGrowth = (newListings / Math.max(1, props.length)) * 15 + Math.random() * 5;
    
    return {
      district,
      city,
      avgPrice: Math.round(avgPrice),
      listingsCount: props.length,
      demandScore,
      priceGrowth: Math.round(priceGrowth * 10) / 10,
    };
  }).sort((a, b) => b.demandScore - a.demandScore);
}

/**
 * Calculate popular areas by searches and listings
 */
export function calculatePopularAreas(
  properties: Property[],
  searchCounts: Record<string, number> = {}
): MarketAnalytics["popularAreas"] {
  const byCity = groupBy(properties, p => p.city);
  
  return Object.entries(byCity).map(([city, props]) => {
    const prices = props.map(p => p.price);
    const avgPrice = calculateAverage(prices);
    
    return {
      area: city,
      searchCount: searchCounts[city] ?? Math.floor(props.length * (10 + Math.random() * 20)),
      listingsCount: props.length,
      avgPrice: Math.round(avgPrice),
    };
  }).sort((a, b) => b.searchCount - a.searchCount);
}

/**
 * Calculate investment scores for districts
 */
export function calculateInvestmentScores(
  properties: Property[]
): MarketAnalytics["investmentScore"] {
  const districtData = calculateDistrictHeatmap(properties);
  
  return districtData.slice(0, 10).map(d => {
    // Calculate investment score
    let score = 50;
    
    // Higher demand = better investment
    score += d.demandScore * 0.3;
    
    // Price growth potential
    if (d.priceGrowth > 10) score += 15;
    else if (d.priceGrowth > 5) score += 10;
    
    // Market liquidity (more listings = easier to sell/buy)
    if (d.listingsCount >= 20) score += 10;
    else if (d.listingsCount >= 10) score += 5;
    
    // Normalize score
    score = Math.min(100, Math.max(0, Math.round(score)));
    
    // Estimate ROI
    const roi = d.priceGrowth + 5; // Simplified: price growth + rental yield estimate
    
    // Risk assessment
    let risk: "low" | "medium" | "high" = "medium";
    if (d.listingsCount >= 20 && d.demandScore >= 60) {
      risk = "low";
    } else if (d.listingsCount < 5 || d.demandScore < 30) {
      risk = "high";
    }
    
    // Generate recommendation
    let recommendation: string;
    if (score >= 75 && risk !== "high") {
      recommendation = "Yaxshi investitsiya imkoniyati. Ko'proq o'rganing.";
    } else if (score >= 50) {
      recommendation = "O'rtacha potentsial. Batafsil tahlil tavsiya etiladi.";
    } else {
      recommendation = "Yuqori xavf. Ehtiyotkorlik bilan qarang.";
    }
    
    return {
      district: `${d.district}, ${d.city}`,
      score,
      roi: Math.round(roi * 10) / 10,
      risk,
      recommendation,
    };
  });
}

/**
 * Calculate category statistics
 */
export function calculateCategoryStats(
  properties: Property[]
): MarketAnalytics["categoryStats"] {
  const categoryLabels: Record<string, string> = {
    apartment: "Kvartira",
    house: "Uy",
    villa: "Villa",
    office: "Ofis",
    land: "Yer",
    rent: "Ijara",
  };
  
  const byCategory = groupBy(properties, p => p.category);
  
  return Object.entries(byCategory).map(([category, props]) => {
    const prices = props.map(p => p.price);
    const avgPrice = calculateAverage(prices);
    
    // Estimate average days on market
    const now = new Date();
    const daysOnMarket = props.map(p => {
      const created = new Date(p.createdAt);
      return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });
    const avgDays = calculateAverage(daysOnMarket);
    
    return {
      category: categoryLabels[category] || category,
      avgPrice: Math.round(avgPrice),
      listingsCount: props.length,
      avgDaysOnMarket: Math.round(avgDays),
    };
  }).sort((a, b) => b.listingsCount - a.listingsCount);
}

/**
 * Generate complete market analytics
 */
export function generateMarketAnalytics(
  properties: Property[],
  searchCounts?: Record<string, number>
): MarketAnalytics {
  // Filter to active properties only
  const activeProperties = properties.filter(p => p.status === "active");
  
  return {
    priceTrends: calculatePriceTrends(activeProperties),
    districtHeatmap: calculateDistrictHeatmap(activeProperties),
    popularAreas: calculatePopularAreas(activeProperties, searchCounts),
    investmentScore: calculateInvestmentScores(activeProperties),
    categoryStats: calculateCategoryStats(activeProperties),
  };
}

/**
 * Get market summary for a specific area
 */
export function getAreaMarketSummary(
  properties: Property[],
  city: string,
  district?: string
): {
  avgPrice: number;
  medianPrice: number;
  listingsCount: number;
  priceRange: { min: number; max: number };
  pricePerSqm: number;
  demandLevel: "low" | "medium" | "high";
  priceComparison: string;
} {
  let areaProperties = properties.filter(p => 
    p.city === city && p.status === "active"
  );
  
  if (district) {
    areaProperties = areaProperties.filter(p => p.district === district);
  }
  
  const prices = areaProperties.map(p => p.price);
  const avgPrice = calculateAverage(prices);
  const medianPrice = calculateMedian(prices);
  
  // Calculate price per sqm
  const pricesPerSqm = areaProperties
    .filter(p => p.area > 0)
    .map(p => p.price / p.area);
  const avgPricePerSqm = calculateAverage(pricesPerSqm);
  
  // Calculate demand level
  const avgViews = areaProperties.reduce((sum, p) => sum + p.views, 0) / Math.max(1, areaProperties.length);
  const avgFavorites = areaProperties.reduce((sum, p) => sum + p.favoritesCount, 0) / Math.max(1, areaProperties.length);
  
  let demandLevel: "low" | "medium" | "high" = "medium";
  const demandScore = avgViews * 0.3 + avgFavorites * 3;
  if (demandScore > 50) demandLevel = "high";
  else if (demandScore < 20) demandLevel = "low";
  
  // Compare to city average
  const cityAvg = calculateAverage(
    properties.filter(p => p.city === city && p.status === "active").map(p => p.price)
  );
  let priceComparison: string;
  if (avgPrice > cityAvg * 1.1) {
    priceComparison = "Shahar o'rtachasidan yuqori";
  } else if (avgPrice < cityAvg * 0.9) {
    priceComparison = "Shahar o'rtachasidan past";
  } else {
    priceComparison = "Shahar o'rtachasiga yaqin";
  }
  
  return {
    avgPrice: Math.round(avgPrice),
    medianPrice: Math.round(medianPrice),
    listingsCount: areaProperties.length,
    priceRange: {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0),
    },
    pricePerSqm: Math.round(avgPricePerSqm),
    demandLevel,
    priceComparison,
  };
}

/**
 * Predict future price trend (simplified)
 */
export function predictPriceTrend(
  properties: Property[],
  city: string,
  months = 3
): {
  currentAvg: number;
  predictedAvg: number;
  changePercent: number;
  confidence: "low" | "medium" | "high";
  factors: string[];
} {
  const cityProperties = properties.filter(p => 
    p.city === city && p.status === "active"
  );
  
  const currentAvg = calculateAverage(cityProperties.map(p => p.price));
  
  // Simplified prediction based on demand and recent trends
  const demandScore = cityProperties.reduce((sum, p) => 
    sum + p.views * 0.1 + p.favoritesCount, 0
  ) / Math.max(1, cityProperties.length);
  
  // Base growth rate
  let growthRate = 0.02; // 2% base
  
  // Adjust based on demand
  if (demandScore > 30) growthRate += 0.02;
  if (demandScore > 60) growthRate += 0.02;
  
  // Adjust based on new listings (supply)
  const newListingsRatio = cityProperties.filter(p => p.isNew).length / Math.max(1, cityProperties.length);
  if (newListingsRatio > 0.3) growthRate -= 0.01; // High supply = lower growth
  
  const predictedAvg = currentAvg * (1 + growthRate * months);
  const changePercent = ((predictedAvg - currentAvg) / currentAvg) * 100;
  
  // Determine confidence
  let confidence: "low" | "medium" | "high" = "medium";
  if (cityProperties.length >= 50) confidence = "high";
  else if (cityProperties.length < 10) confidence = "low";
  
  // Generate factors
  const factors: string[] = [];
  if (demandScore > 30) factors.push("Yuqori talab");
  if (newListingsRatio < 0.2) factors.push("Cheklangan taklif");
  if (cityProperties.length > 30) factors.push("Faol bozor");
  
  return {
    currentAvg: Math.round(currentAvg),
    predictedAvg: Math.round(predictedAvg),
    changePercent: Math.round(changePercent * 10) / 10,
    confidence,
    factors,
  };
}
