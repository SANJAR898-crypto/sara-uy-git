export type PropertyCategory = "apartment" | "house" | "office" | "land" | "villa" | "rent";
export type DealType = "sale" | "rent";
export type PropertyStatus =
  | "draft"
  | "pending"
  | "active"
  | "paused"
  | "rejected"
  | "archived"
  | "expired"
  | "sold";
export type UserRole = "user" | "seller" | "admin";
export type SubscriptionPlanKey = "free" | "vip" | "premium" | "agency" | "developer";

export interface PropertyAmenities {
  parking?: boolean;
  balcony?: boolean;
  garden?: boolean;
  pool?: boolean;
  security?: boolean;
  internet?: boolean;
  ac?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  username: string | null;
  avatar: string;
  verified: boolean;
  isAgency: boolean;
  agencyName?: string | null;
  rating: number;
  dealsCount: number;
  phone: string | null;
  memberSince: string;
  bio?: string | null;
  languages?: string[];
  workingHours?: string | null;
  responseTimeMinutes?: number | null;
  responseRate?: number | null;
}

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  dealType: DealType;
  price: number;
  currency: "USD" | "UZS";
  city: string;
  district: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  nearbyPlaces: string[];
  rooms: number;
  area: number;
  floor?: number | null;
  totalFloors?: number | null;
  bathrooms?: number | null;
  kitchenArea?: number | null;
  yearBuilt?: number | null;
  heating?: string | null;
  furniture?: string | null;
  repairStatus?: string | null;
  amenities: PropertyAmenities;
  negotiable: boolean;
  installment: boolean;
  mortgage: boolean;
  rentPeriod?: string | null;
  serviceFee?: number | null;
  contactPhone?: string | null;
  contactTelegram?: string | null;
  hidePhone: boolean;
  preferredContactTime?: string | null;
  images: string[];
  isVip: boolean;
  isPremium: boolean;
  isVerified: boolean;
  isNew: boolean;
  status: PropertyStatus;
  rejectionReason?: string | null;
  createdAt: string;
  description: string;
  seller: Seller;
  views: number;
  favoritesCount: number;
  telegramContacts: number;
  phoneCalls: number;
  messagesCount: number;
  expiresAt?: string | null;
  vipExpiresAt?: string | null;
  premiumExpiresAt?: string | null;
  soldAt?: string | null;
}

export interface Story {
  id: string;
  name: string;
  avatar: string;
  image: string;
  isVip: boolean;
  seen: boolean;
}

export interface Category {
  id: PropertyCategory;
  label: string;
  icon: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

export interface CurrentUser {
  id: string;
  telegramId: number;
  name: string;
  username: string | null;
  phone: string | null;
  avatar: string;
  role: UserRole;
  verified: boolean;
  isAgency: boolean;
  agencyName: string | null;
  rating: number;
  dealsCount: number;
  memberSince: string;
  listingsCount: number;
  favoritesCount: number;
  viewsCount: number;
  bio?: string | null;
  languages?: string[];
  workingHours?: string | null;
  responseTimeMinutes?: number | null;
  responseRate?: number | null;
}

/* ============================================================
   SELLER PLATFORM — dashboard, wizard, subscriptions
   ============================================================ */
export interface SellerDashboardStats {
  totals: {
    total: number;
    active: number;
    draft: number;
    pending: number;
    paused: number;
    rejected: number;
    archived: number;
    expired: number;
    sold: number;
    vip: number;
    premium: number;
  };
  engagement: {
    views: number;
    favorites: number;
    telegramContacts: number;
    phoneCalls: number;
    messages: number;
  };
  weekly: { date: string; views: number }[];
  monthly: { month: string; views: number }[];
  topListings: { id: string; title: string; views: number; favoritesCount: number }[];
  subscription: SellerSubscriptionInfo;
}

export interface SubscriptionPlan {
  key: SubscriptionPlanKey;
  name: string;
  maxListings: number;
  maxVipListings: number;
  maxPremiumListings: number;
  maxImagesPerListing: number;
  priceMonthly: number;
  durationDays: number;
  features: string[];
}

export interface SellerSubscriptionInfo {
  plan: SubscriptionPlan;
  status: "active" | "expired" | "cancelled";
  startedAt: string;
  expiresAt: string | null;
  usage: {
    listings: number;
    vipListings: number;
    premiumListings: number;
  };
}

export interface ListingDraftPayload {
  step: number;
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface ListingAnalytics {
  propertyId: string;
  daily: { date: string; views: number }[];
  totals: {
    views: number;
    favorites: number;
    telegramContacts: number;
    phoneCalls: number;
    messages: number;
    conversionRate: number;
  };
}

export interface AiAssistResult {
  title?: string;
  description?: string;
  tags?: string[];
  source: "heuristic" | "ai";
}

/* ============================================================
   AI ECOSYSTEM TYPES (Phase 6)
   ============================================================ */

export interface AiPriceAdvice {
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
}

export interface AiQualityScore {
  overall: number;
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

export interface AiMatchScore {
  score: number;
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

export interface AiSearchResult {
  query: {
    original: string;
    parsed: Record<string, unknown>;
    description: string;
    confidence: number;
    suggestions: string[];
  };
  properties: Property[];
  total: number;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  properties?: string[];
  suggestions?: string[];
}

export interface AiMarketSummary {
  avgPrice: number;
  medianPrice: number;
  listingsCount: number;
  priceRange: { min: number; max: number };
  pricePerSqm: number;
  demandLevel: "low" | "medium" | "high";
  priceComparison: string;
}

export interface AiModerationResult {
  approved: boolean;
  confidence: number;
  flags: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    confidence: number;
    message: string;
  }>;
  suggestedAction: "approve" | "review" | "reject" | "ban_user";
  reviewPriority: "low" | "medium" | "high" | "urgent";
}
