import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  serial,
  index,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================================================
// REGIONS & DISTRICTS
// ============================================================================
export const regions = pgTable("regions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nameUz: varchar("name_uz", { length: 128 }).notNull(),
  nameRu: varchar("name_ru", { length: 128 }).notNull(),
  nameEn: varchar("name_en", { length: 128 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const districts = pgTable(
  "districts",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    regionId: varchar("region_id", { length: 64 })
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    nameUz: varchar("name_uz", { length: 128 }).notNull(),
    nameRu: varchar("name_ru", { length: 128 }).notNull(),
    nameEn: varchar("name_en", { length: 128 }).notNull(),
  },
  (t) => [index("districts_region_idx").on(t.regionId)],
);

// ============================================================================
// USERS (Guest -> Seller upgrade via Telegram auth)
// ============================================================================
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    telegramId: varchar("telegram_id", { length: 32 }).notNull(),
    username: varchar("username", { length: 64 }),
    firstName: varchar("first_name", { length: 128 }),
    lastName: varchar("last_name", { length: 128 }),
    avatarUrl: text("avatar_url"),
    languageCode: varchar("language_code", { length: 8 }).default("uz"),
    isTelegramPremium: boolean("is_telegram_premium").notNull().default(false),
    phoneNumber: varchar("phone_number", { length: 32 }),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    isSeller: boolean("is_seller").notNull().default(false),
    sellerBio: text("seller_bio"),
    agencyName: varchar("agency_name", { length: 128 }),
    sellerRating: numeric("seller_rating", { precision: 3, scale: 2 }).notNull().default("0"),
    sellerSince: timestamp("seller_since", { withTimezone: true }),
    isBanned: boolean("is_banned").notNull().default(false),
    banReason: text("ban_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_telegram_id_idx").on(t.telegramId)],
);

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id", { length: 32 }).primaryKey(), // vip | premium | story | standard
  name: varchar("name", { length: 64 }).notNull(),
  price: integer("price").notNull(),
  durationDays: integer("duration_days").notNull(),
  badge: varchar("badge", { length: 32 }).notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ============================================================================
// LISTINGS
// ============================================================================
export const listings = pgTable(
  "listings",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    dealType: varchar("deal_type", { length: 24 }).notNull(), // sale | rent | daily_rent | monthly_rent
    propertyType: varchar("property_type", { length: 24 }).notNull(),
    regionId: varchar("region_id", { length: 64 }).references(() => regions.id),
    districtId: varchar("district_id", { length: 64 }).references(() => districts.id),
    address: text("address").notNull().default(""),
    lat: numeric("lat", { precision: 10, scale: 7 }),
    lng: numeric("lng", { precision: 10, scale: 7 }),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("UZS"),
    isNegotiable: boolean("is_negotiable").notNull().default(false),
    area: numeric("area", { precision: 8, scale: 2 }).notNull(),
    rooms: integer("rooms").notNull().default(1),
    floor: integer("floor"),
    maxFloors: integer("max_floors"),
    amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
    plan: varchar("plan", { length: 32 }).notNull().default("standard"),
    planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
    status: varchar("status", { length: 16 }).notNull().default("pending"), // pending|approved|rejected|archived
    rejectionReason: text("rejection_reason"),
    viewsCount: integer("views_count").notNull().default(0),
    favoritesCount: integer("favorites_count").notNull().default(0),
    sharesCount: integer("shares_count").notNull().default(0),
    callsCount: integer("calls_count").notNull().default(0),
    telegramClicksCount: integer("telegram_clicks_count").notNull().default(0),
    reportsCount: integer("reports_count").notNull().default(0),
    videoUrl: text("video_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("listings_owner_idx").on(t.ownerId),
    index("listings_status_idx").on(t.status),
    index("listings_region_idx").on(t.regionId),
    index("listings_district_idx").on(t.districtId),
    index("listings_deal_type_idx").on(t.dealType),
    index("listings_property_type_idx").on(t.propertyType),
    index("listings_price_idx").on(t.price),
    index("listings_plan_idx").on(t.plan),
    index("listings_created_idx").on(t.createdAt),
  ],
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("listing_images_listing_idx").on(t.listingId)],
);

export const priceHistory = pgTable(
  "price_history",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 14, scale: 2 }).notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("price_history_listing_idx").on(t.listingId)],
);

// ============================================================================
// FAVORITES / COLLECTIONS
// ============================================================================
export const favoriteCollections = pgTable("favorite_collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    collectionId: integer("collection_id").references(() => favoriteCollections.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("favorites_user_listing_idx").on(t.userId, t.listingId),
    index("favorites_user_idx").on(t.userId),
  ],
);

// ============================================================================
// STORIES
// ============================================================================
export const stories = pgTable(
  "stories",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 128 }).notNull(),
    coverUrl: text("cover_url").notNull(),
    category: varchar("category", { length: 24 }).notNull().default("news"),
    isFeatured: boolean("is_featured").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    viewsCount: integer("views_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("stories_active_idx").on(t.isActive)],
);

export const storySlides = pgTable(
  "story_slides",
  {
    id: serial("id").primaryKey(),
    storyId: integer("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    linkText: varchar("link_text", { length: 64 }),
    linkUrl: text("link_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(5000),
  },
  (t) => [index("story_slides_story_idx").on(t.storyId)],
);

export const storyViews = pgTable(
  "story_views",
  {
    id: serial("id").primaryKey(),
    storyId: integer("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    viewerKey: varchar("viewer_key", { length: 64 }).notNull(),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("story_views_unique_idx").on(t.storyId, t.viewerKey)],
);

// ============================================================================
// INQUIRIES (contact leads) / REVIEWS / REPORTS
// ============================================================================
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    contactType: varchar("contact_type", { length: 16 }).notNull(), // call | telegram | share
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_listing_idx").on(t.listingId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    status: varchar("status", { length: 16 }).notNull().default("approved"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reviews_seller_idx").on(t.sellerId)],
);

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    reporterId: integer("reporter_id").references(() => users.id, { onDelete: "set null" }),
    reason: varchar("reason", { length: 32 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reports_listing_idx").on(t.listingId), index("reports_status_idx").on(t.status)],
);

// ============================================================================
// SUBSCRIPTIONS & PAYMENTS
// ============================================================================
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
    planId: varchar("plan_id", { length: 32 })
      .notNull()
      .references(() => subscriptionPlans.id),
    amount: integer("amount").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    paymentMethod: varchar("payment_method", { length: 16 }).notNull().default("manual"),
    transactionId: varchar("transaction_id", { length: 128 }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payments_user_idx").on(t.userId), index("payments_status_idx").on(t.status)],
);

// ============================================================================
// ANALYTICS & ACTIVITY LOGS
// ============================================================================
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    eventType: varchar("event_type", { length: 24 }).notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("analytics_type_idx").on(t.eventType),
    index("analytics_listing_idx").on(t.listingId),
    index("analytics_created_idx").on(t.createdAt),
  ],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entity_type", { length: 32 }),
    entityId: integer("entity_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_logs_user_idx").on(t.userId)],
);

export const savedSearches = pgTable(
  "saved_searches",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    query: text("query"),
    filters: jsonb("filters").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("saved_searches_user_idx").on(t.userId)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 128 }).notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 32 }).notNull().default("system"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);
