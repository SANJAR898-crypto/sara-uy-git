import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { and, asc, desc, eq, gte, ilike, lte, or, type SQL } from "drizzle-orm";
import { mapProperty } from "@/lib/mappers";
import type { Property } from "@/types";

export interface PropertyFilters {
  status?: string | string[];
  category?: string | null;
  dealType?: string | null;
  city?: string | null;
  district?: string | null;
  query?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRooms?: number | null;
  maxRooms?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  sellerId?: number | null;
  vipOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "views";
  limit?: number;
  offset?: number;
}

export async function queryProperties(filters: PropertyFilters): Promise<Property[]> {
  const conditions: SQL[] = [];

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      const clauses = filters.status.map((s) => eq(properties.status, s));
      if (clauses.length === 1) conditions.push(clauses[0]);
      else if (clauses.length > 1) conditions.push(or(...clauses)!);
    } else {
      conditions.push(eq(properties.status, filters.status));
    }
  }
  if (filters.category) conditions.push(eq(properties.category, filters.category));
  if (filters.dealType) conditions.push(eq(properties.dealType, filters.dealType));
  if (filters.city) conditions.push(eq(properties.city, filters.city));
  if (filters.district) conditions.push(eq(properties.district, filters.district));
  if (filters.sellerId != null) conditions.push(eq(properties.sellerId, filters.sellerId));
  if (filters.vipOnly) conditions.push(eq(properties.isVip, true));
  if (filters.minPrice != null) conditions.push(gte(properties.price, String(filters.minPrice)));
  if (filters.maxPrice != null) conditions.push(lte(properties.price, String(filters.maxPrice)));
  if (filters.minRooms != null) conditions.push(gte(properties.rooms, filters.minRooms));
  if (filters.maxRooms != null) conditions.push(lte(properties.rooms, filters.maxRooms));
  if (filters.minArea != null) conditions.push(gte(properties.area, filters.minArea));
  if (filters.maxArea != null) conditions.push(lte(properties.area, filters.maxArea));
  if (filters.query) {
    const like = `%${filters.query}%`;
    conditions.push(
      or(ilike(properties.title, like), ilike(properties.district, like), ilike(properties.city, like))!
    );
  }

  const orderBy =
    filters.sort === "price_asc"
      ? asc(properties.price)
      : filters.sort === "price_desc"
        ? desc(properties.price)
        : filters.sort === "views"
          ? desc(properties.views)
          : desc(properties.createdAt);

  const rows = await db
    .select({ property: properties, seller: users })
    .from(properties)
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy)
    .limit(filters.limit ?? 100)
    .offset(filters.offset ?? 0);

  return rows.map((r) => mapProperty(r.property, r.seller));
}
