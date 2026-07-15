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
    rooms: integer("rooms").notNull().default(1),
    area: integer("area").notNull().default(0),
    floor: integer("floor"),
    totalFloors: integer("total_floors"),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    isVip: boolean("is_vip").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    isNew: boolean("is_new").notNull().default(true),
    status: text("status").notNull().default("pending"), // pending | active | rejected | archived
    rejectionReason: text("rejection_reason"),
    views: integer("views").notNull().default(0),
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
    type: text("type").notNull().default("system"), // price | message | system | vip
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)]
);

export type UserRow = typeof users.$inferSelect;
export type PropertyRow = typeof properties.$inferSelect;
export type FavoriteRow = typeof favorites.$inferSelect;
export type StoryRow = typeof stories.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
