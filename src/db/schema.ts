import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/* ============================================================
   USERS  (Telegram-authenticated accounts)
   ============================================================ */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  languageCode: text("language_code"),
  role: text("role").notNull().default("user"), // user | seller | admin
  isAgency: boolean("is_agency").notNull().default(false),
  agencyName: text("agency_name"),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.8"),
  dealsCount: integer("deals_count").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
  // ---- Seller profile enrichment (Phase 4) ----
  bio: text("bio"),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  workingHours: text("working_hours"),
  responseTimeMinutes: integer("response_time_minutes"),
  responseRate: integer("response_rate"), // 0-100
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================
   PROPERTIES  (Listings)
   ============================================================ */
export const properties = pgTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    category: text("category").notNull(), // apartment | house | villa | office | land | rent
    dealType: text("deal_type").notNull(), // sale | rent
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    city: text("city").notNull(),
    district: text("district").notNull(),
    address: text("address"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    nearbyPlaces: jsonb("nearby_places").$type<string[]>().notNull().default([]),
    rooms: integer("rooms").notNull().default(1),
    area: integer("area").notNull().default(0),
    floor: integer("floor"),
    totalFloors: integer("total_floors"),
    images: jsonb("images").$type<string[]>().notNull().default([]),

    // ---- Property details (Phase 4) ----
    bathrooms: integer("bathrooms"),
    kitchenArea: integer("kitchen_area"),
    yearBuilt: integer("year_built"),
    heating: text("heating"),
    furniture: text("furniture"),
    repairStatus: text("repair_status"),
    amenities: jsonb("amenities")
      .$type<{
        parking?: boolean;
        balcony?: boolean;
        garden?: boolean;
        pool?: boolean;
        security?: boolean;
        internet?: boolean;
        ac?: boolean;
      }>()
      .notNull()
      .default({}),

    // ---- Price extras ----
    negotiable: boolean("negotiable").notNull().default(false),
    installment: boolean("installment").notNull().default(false),
    mortgage: boolean("mortgage").notNull().default(false),
    rentPeriod: text("rent_period"), // daily | monthly | yearly
    serviceFee: numeric("service_fee", { precision: 12, scale: 2 }),

    // ---- Contact overrides ----
    contactPhone: text("contact_phone"),
    contactTelegram: text("contact_telegram"),
    hidePhone: boolean("hide_phone").notNull().default(false),
    preferredContactTime: text("preferred_contact_time"),

    isVip: boolean("is_vip").notNull().default(false),
    isPremium: boolean("is_premium").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    isNew: boolean("is_new").notNull().default(true),
    // draft | pending | active | paused | rejected | archived | expired | sold
    status: text("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),

    views: integer("views").notNull().default(0),
    favoritesCount: integer("favorites_count").notNull().default(0),
    telegramContacts: integer("telegram_contacts").notNull().default(0),
    phoneCalls: integer("phone_calls").notNull().default(0),
    messagesCount: integer("messages_count").notNull().default(0),

    expiresAt: timestamp("expires_at", { withTimezone: true }),
    vipExpiresAt: timestamp("vip_expires_at", { withTimezone: true }),
    premiumExpiresAt: timestamp("premium_expires_at", { withTimezone: true }),
    soldAt: timestamp("sold_at", { withTimezone: true }),

    sellerId: integer("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("properties_status_idx").on(table.status),
    index("properties_category_idx").on(table.category),
    index("properties_seller_idx").on(table.sellerId),
  ]
);

/* ============================================================
   FAVORITES
   ============================================================ */
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("favorites_user_property_unique").on(table.userId, table.propertyId)]
);

/* ============================================================
   STORIES
   ============================================================ */
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  imageUrl: text("image_url").notNull(),
  isVip: boolean("is_vip").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    // price | message | system | vip | premium | favorite | contact | view_milestone | listing_expiring
    type: text("type").notNull().default("system"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)]
);

/* ============================================================
   LISTING DRAFTS  (multi-step wizard autosave)
   ============================================================ */
export const listingDrafts = pgTable(
  "listing_drafts",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    step: integer("step").notNull().default(1),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("listing_drafts_seller_unique").on(table.sellerId)]
);

/* ============================================================
   SUBSCRIPTION PLANS  (configurable limits)
   ============================================================ */
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // free | vip | premium | agency | developer
  name: text("name").notNull(),
  maxListings: integer("max_listings").notNull().default(3),
  maxVipListings: integer("max_vip_listings").notNull().default(0),
  maxPremiumListings: integer("max_premium_listings").notNull().default(0),
  maxImagesPerListing: integer("max_images_per_listing").notNull().default(6),
  priceMonthly: numeric("price_monthly", { precision: 10, scale: 2 }).notNull().default("0"),
  durationDays: integer("duration_days").notNull().default(30),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================
   SELLER SUBSCRIPTIONS
   ============================================================ */
export const sellerSubscriptions = pgTable(
  "seller_subscriptions",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planKey: text("plan_key").notNull().default("free"),
    status: text("status").notNull().default("active"), // active | expired | cancelled
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [unique("seller_subscriptions_seller_unique").on(table.sellerId)]
);

/* ============================================================
   PROPERTY EVENTS  (analytics time-series)
   ============================================================ */
export const propertyEvents = pgTable(
  "property_events",
  {
    id: serial("id").primaryKey(),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    // view | favorite | unfavorite | telegram | phone | message
    type: text("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("property_events_property_idx").on(table.propertyId),
    index("property_events_created_idx").on(table.createdAt),
  ]
);

export type UserRow = typeof users.$inferSelect;
export type PropertyRow = typeof properties.$inferSelect;
export type FavoriteRow = typeof favorites.$inferSelect;
export type StoryRow = typeof stories.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type ListingDraftRow = typeof listingDrafts.$inferSelect;
export type SubscriptionPlanRow = typeof subscriptionPlans.$inferSelect;
export type SellerSubscriptionRow = typeof sellerSubscriptions.$inferSelect;
export type PropertyEventRow = typeof propertyEvents.$inferSelect;

/* ============================================================
   AUDIT LOGS  (Phase 5 — Enterprise Admin Panel)
   Every privileged admin action is recorded here for compliance.
   ============================================================ */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorTelegramId: bigint("actor_telegram_id", { mode: "number" }),
    actorName: text("actor_name"),
    action: text("action").notNull(), // e.g. property.approve, user.role_change, settings.update
    targetType: text("target_type"), // property | user | story | settings | flag | payment | notification | report
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_created_idx").on(table.createdAt),
    index("audit_logs_action_idx").on(table.action),
  ]
);

/* ============================================================
   REPORTS  (user-submitted reports for moderation)
   ============================================================ */
export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    reporterId: integer("reporter_id").references(() => users.id, { onDelete: "set null" }),
    targetType: text("target_type").notNull(), // property | user
    targetId: integer("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").notNull().default("open"), // open | reviewing | resolved | dismissed
    resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reports_status_idx").on(table.status),
    index("reports_target_idx").on(table.targetType, table.targetId),
  ]
);

/* ============================================================
   FEATURE FLAGS
   ============================================================ */
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

/* ============================================================
   SYSTEM SETTINGS  (key/value store, incl. maintenance mode)
   ============================================================ */
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

/* ============================================================
   PAYMENTS  (subscription revenue ledger)
   ============================================================ */
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planKey: text("plan_key").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("UZS"),
    status: text("status").notNull().default("pending"), // pending | paid | failed | refunded
    method: text("method").notNull().default("manual"), // manual | click | payme | card
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [index("payments_seller_idx").on(table.sellerId), index("payments_status_idx").on(table.status)]
);

export type AuditLogRow = typeof auditLogs.$inferSelect;
export type ReportRow = typeof reports.$inferSelect;
export type FeatureFlagRow = typeof featureFlags.$inferSelect;
export type SystemSettingRow = typeof systemSettings.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

/* ============================================================
   PHASE 7 — ENTERPRISE AI ECOSYSTEM
   ============================================================ */

/**
 * AI enrichment columns on `properties`. Populated by the AI Moderation,
 * AI Image Verification and AI Fraud Detection pipelines. Kept nullable so
 * legacy rows and drafts remain valid without a backfill.
 */
export const propertiesAi = pgTable("properties_ai", {
  propertyId: integer("property_id")
    .primaryKey()
    .references(() => properties.id, { onDelete: "cascade" }),
  // AI Image Verification
  imageQualityScore: integer("image_quality_score"), // 0-100
  imageAuthenticityScore: integer("image_authenticity_score"), // 0-100
  imageSuggestions: jsonb("image_suggestions").$type<string[]>().notNull().default([]),
  // AI Moderation
  moderationStatus: text("moderation_status").notNull().default("pending"), // approved | rejected | flagged | needs_review | pending
  moderationReasons: jsonb("moderation_reasons").$type<string[]>().notNull().default([]),
  moderationScore: integer("moderation_score"), // 0-100 confidence
  // AI Fraud Detection
  fraudScore: integer("fraud_score"), // 0-100 (higher = more suspicious)
  fraudSignals: jsonb("fraud_signals").$type<string[]>().notNull().default([]),
  // AI Assist metadata
  aiKeywords: jsonb("ai_keywords").$type<string[]>().notNull().default([]),
  aiDetectedCategory: text("ai_detected_category"),
  aiNormalizedDistrict: text("ai_normalized_district"),
  // AI Investment / Market snapshot cached at last computation
  investmentScore: integer("investment_score"),
  investmentBreakdown: jsonb("investment_breakdown").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * AI Chat Assistant — persisted conversation turns so buyers can continue a
 * session across screens/devices and admins can audit AI advice quality.
 */
export const aiChatMessages = pgTable(
  "ai_chat_messages",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull(),
    role: text("role").notNull(), // user | assistant | system
    content: text("content").notNull(),
    language: text("language").notNull().default("uz"),
    propertyId: integer("property_id").references(() => properties.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ai_chat_session_idx").on(table.sessionId),
    index("ai_chat_user_idx").on(table.userId),
  ]
);

/**
 * AI Logging — structured telemetry for every AI service invocation
 * (provider used, latency, success/error, token estimate) so admins can
 * monitor cost, reliability and abuse (AI Architecture requirement).
 */
export const aiLogs = pgTable(
  "ai_logs",
  {
    id: serial("id").primaryKey(),
    endpoint: text("endpoint").notNull(), // e.g. ai.assist, ai.chat, ai.moderate
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    provider: text("provider").notNull().default("heuristic"), // heuristic | openai
    model: text("model"),
    success: boolean("success").notNull().default(true),
    latencyMs: integer("latency_ms").notNull().default(0),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ai_logs_endpoint_idx").on(table.endpoint),
    index("ai_logs_created_idx").on(table.createdAt),
  ]
);

export type PropertyAiRow = typeof propertiesAi.$inferSelect;
export type AiChatMessageRow = typeof aiChatMessages.$inferSelect;
export type AiLogRow = typeof aiLogs.$inferSelect;
