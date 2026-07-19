/**
 * Sara Uylar — AI Ecosystem (Phase 6)
 * Central export for all AI services
 */

// Types
export type {
  ParsedSearchQuery,
  PriceAdviceInput,
  PriceAdviceResult,
  ListingQualityScore,
  ImageVerificationResult,
  MatchScoreResult,
  RecommendationResult,
  MarketAnalytics,
  ModerationResult,
  ChatMessage,
  ChatIntent,
  AiNotification,
  UserTasteProfile,
  AiAnalyticsEvent,
} from "./types";

// Search Service
export {
  parseNaturalLanguageQuery,
  filtersToQueryParams,
  describeQuery,
} from "./search";

// Pricing Service
export {
  computeAdvancedPriceAdvice,
  getPriceWarnings,
  calculateInvestmentScore,
} from "./pricing";

// Image Verification Service
export {
  verifyImages,
  quickImageCheck,
  calculateImageScore,
} from "./images";

// Recommendation Service
export {
  buildUserProfile,
  calculateMatchScore,
  generateRecommendations,
  findSimilarProperties,
  getContinueBrowsing,
} from "./recommendations";

// Moderation Service
export {
  moderateListing,
  batchModerate,
  getPriorityReviewQueue,
} from "./moderation";

// Market Analytics Service
export {
  calculatePriceTrends,
  calculateDistrictHeatmap,
  calculatePopularAreas,
  calculateInvestmentScores,
  calculateCategoryStats,
  generateMarketAnalytics,
  getAreaMarketSummary,
  predictPriceTrend,
} from "./market";

// Chat Assistant Service
export {
  detectIntent,
  generateResponse,
  generateSearchSuggestions,
  processUserMessage,
  getHelpText,
  formatPropertyForChat,
} from "./chat";

// Quality Score Service
export {
  calculateListingQuality,
  getQualityImprovements,
  generateAiTitle,
  generateAiDescription,
  generateAiTags,
} from "./quality";
