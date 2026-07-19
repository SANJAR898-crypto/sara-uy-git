/**
 * Sara Uylar — AI Ecosystem Types (Phase 6)
 * Central type definitions for all AI services
 */

import type { Property, PropertyCategory, DealType } from "@/types";

/* ============================================================
   NATURAL LANGUAGE SEARCH
   ============================================================ */
export interface ParsedSearchQuery {
  query: string;
  filters: {
    category?: PropertyCategory;
    dealType?: DealType;
    city?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    minRooms?: number;
    maxRooms?: number;
    minArea?: number;
    maxArea?: number;
    amenities?: string[];
    keywords?: string[];
  };
  confidence: number;
  suggestions: string[];
}

/* ============================================================
   AI PRICE ADVISOR
   ============================================================ */
export interface PriceAdviceInput {
  category: string;
  dealType: string;
  city: string;
  district?: string;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  condition?: string;
  yearBuilt?: number;
}

export interface PriceAdviceResult {
  low: number;
  fair: number;
  high: number;
  currency: string;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  pricePerSqm?: number;
  marketComparison: "below" | "fair" | "above";
  estimatedDemand: "low" | "medium" | "high";
  estimatedSellingDays: number;
  similarListings: Array<{
    id: string;
    title: string;
    price: number;
    area: number;
    rooms: number;
  }>;
}

/* ============================================================
   AI LISTING QUALITY
   ============================================================ */
export interface ListingQualityScore {
  overall: number; // 0-100
  breakdown: {
    title: number;
    description: number;
    images: number;
    pricing: number;
    completeness: number;
    seo: number;
  };
  issues: Array<{
    field: string;
    severity: "warning" | "error";
    message: string;
    suggestion: string;
  }>;
  seoKeywords: string[];
  estimatedVisibility: "low" | "medium" | "high";
}

/* ============================================================
   AI IMAGE VERIFICATION
   ============================================================ */
export interface ImageVerificationResult {
  verified: boolean;
  overallConfidence: number;
  images: Array<{
    url: string;
    status: "passed" | "warning" | "failed";
    issues: Array<{
      type: "duplicate" | "internet" | "watermark" | "ai_generated" | "low_quality" | "non_property" | "suspicious_edit";
      confidence: number;
      message: string;
    }>;
  }>;
  summary: {
    totalImages: number;
    passedImages: number;
    warningImages: number;
    failedImages: number;
    duplicatesFound: number;
    internetImagesFound: number;
    watermarksFound: number;
  };
}

/* ============================================================
   AI MATCH SCORE
   ============================================================ */
export interface MatchScoreResult {
  score: number; // 0-100
  breakdown: {
    budget: number;
    location: number;
    size: number;
    features: number;
    history: number;
  };
  reasons: string[];
  explanation: string;
}

/* ============================================================
   AI RECOMMENDATIONS
   ============================================================ */
export interface RecommendationResult {
  property: Property;
  matchScore: number;
  reasons: string[];
  type: "similar" | "budget_friendly" | "trending" | "investment" | "new_listing";
}

/* ============================================================
   AI MARKET ANALYTICS
   ============================================================ */
export interface MarketAnalytics {
  priceTrends: Array<{
    period: string;
    avgPrice: number;
    medianPrice: number;
    priceChange: number;
  }>;
  districtHeatmap: Array<{
    district: string;
    city: string;
    avgPrice: number;
    listingsCount: number;
    demandScore: number;
    priceGrowth: number;
  }>;
  popularAreas: Array<{
    area: string;
    searchCount: number;
    listingsCount: number;
    avgPrice: number;
  }>;
  investmentScore: Array<{
    district: string;
    score: number;
    roi: number;
    risk: "low" | "medium" | "high";
    recommendation: string;
  }>;
  categoryStats: Array<{
    category: string;
    avgPrice: number;
    listingsCount: number;
    avgDaysOnMarket: number;
  }>;
}

/* ============================================================
   AI MODERATION
   ============================================================ */
export interface ModerationResult {
  approved: boolean;
  confidence: number;
  flags: Array<{
    type: "spam" | "fake" | "duplicate" | "suspicious_user" | "unrealistic_price" | "stolen_images" | "inappropriate_content";
    severity: "low" | "medium" | "high";
    confidence: number;
    message: string;
    evidence?: string;
  }>;
  suggestedAction: "approve" | "review" | "reject" | "ban_user";
  reviewPriority: "low" | "medium" | "high" | "urgent";
}

/* ============================================================
   AI CHAT ASSISTANT
   ============================================================ */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    properties?: string[];
    suggestions?: string[];
  };
}

export interface ChatIntent {
  type: "search" | "price_query" | "region_info" | "compare" | "mortgage" | "investment" | "general";
  confidence: number;
  entities: Record<string, string | number>;
}

/* ============================================================
   AI NOTIFICATIONS
   ============================================================ */
export interface AiNotification {
  type: "price_drop" | "better_alternative" | "new_matching" | "investment_opportunity" | "vip_expiring" | "subscription_expiring";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  propertyId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/* ============================================================
   USER TASTE PROFILE
   ============================================================ */
export interface UserTasteProfile {
  userId: number;
  categories: Record<string, number>;
  cities: Record<string, number>;
  districts: Record<string, number>;
  avgPrice: number | null;
  avgRooms: number | null;
  avgArea: number | null;
  priceRange: { min: number; max: number } | null;
  preferredAmenities: string[];
  searchHistory: string[];
  viewedPropertyIds: string[];
  lastUpdated: string;
}

/* ============================================================
   AI ANALYTICS TRACKING
   ============================================================ */
export interface AiAnalyticsEvent {
  type: "ai_search" | "match_click" | "recommendation_click" | "price_advisor" | "image_verification" | "chat_message";
  userId?: number;
  propertyId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}
