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
