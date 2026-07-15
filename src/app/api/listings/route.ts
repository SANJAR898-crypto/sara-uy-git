import { NextResponse } from "next/server";
import { db } from "@/db";
import { listingImages, listings, users } from "@/db/schema";
import { and, asc, desc, eq, gte, ilike, inArray, lte, sql, type SQL } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireSeller } from "@/lib/auth-helpers";
import { listingCreateSchema } from "@/lib/validation";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

const PLAN_RANK: Record<string, number> = { vip: 3, premium: 2, story: 1, standard: 0 };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conditions: SQL[] = [eq(listings.status, "approved")];

    const dealType = searchParams.get("dealType");
    if (dealType) conditions.push(eq(listings.dealType, dealType));

    const propertyType = searchParams.get("propertyType");
    if (propertyType) conditions.push(eq(listings.propertyType, propertyType));

    const regionId = searchParams.get("regionId");
    if (regionId) conditions.push(eq(listings.regionId, regionId));

    const districtId = searchParams.get("districtId");
    if (districtId) conditions.push(eq(listings.districtId, districtId));

    const rooms = searchParams.get("rooms");
    if (rooms) conditions.push(eq(listings.rooms, Number(rooms)));

    const minPrice = searchParams.get("minPrice");
    if (minPrice) conditions.push(gte(listings.price, minPrice));

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) conditions.push(lte(listings.price, maxPrice));

    const minArea = searchParams.get("minArea");
    if (minArea) conditions.push(gte(listings.area, minArea));

    const maxArea = searchParams.get("maxArea");
    if (maxArea) conditions.push(lte(listings.area, maxArea));

    const q = searchParams.get("q");
    if (q) conditions.push(ilike(listings.title, `%${q}%`));

    const featured = searchParams.get("featured");
    if (featured === "vip") conditions.push(eq(listings.plan, "vip"));
    if (featured === "premium") conditions.push(sql`${listings.plan} in ('vip','premium')`);

    const sellerId = searchParams.get("sellerId");
    if (sellerId) conditions.push(eq(listings.ownerId, Number(sellerId)));

    const sort = searchParams.get("sort") ?? "relevance";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

    let orderBy;
    switch (sort) {
      case "price_asc":
        orderBy = [asc(listings.price)];
        break;
      case "price_desc":
        orderBy = [desc(listings.price)];
        break;
      case "newest":
        orderBy = [desc(listings.createdAt)];
        break;
      case "popular":
        orderBy = [desc(listings.viewsCount)];
        break;
      default:
        orderBy = [desc(listings.createdAt)];
    }

    const rows = await db
      .select({
        listing: listings,
        ownerName: users.firstName,
        ownerUsername: users.username,
        ownerAvatar: users.avatarUrl,
        ownerRating: users.sellerRating,
      })
      .from(listings)
      .innerJoin(users, eq(listings.ownerId, users.id))
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const listingIds = rows.map((r) => r.listing.id);
    const images = listingIds.length
      ? await db
          .select()
          .from(listingImages)
          .where(inArray(listingImages.listingId, listingIds))
          .orderBy(asc(listingImages.sortOrder))
      : [];

    let items = rows.map((r) => ({
      ...r.listing,
      owner: { name: r.ownerName, username: r.ownerUsername, avatarUrl: r.ownerAvatar, rating: r.ownerRating },
      images: images.filter((img) => img.listingId === r.listing.id).map((img) => img.url),
    }));

    if (sort === "relevance") {
      items = items.sort(
        (a, b) =>
          PLAN_RANK[b.plan] - PLAN_RANK[a.plan] ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(listings)
      .where(and(...conditions));

    return NextResponse.json({ items, total: count, page, pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    if (!rateLimit(getClientKey(req, "create-listing"), 10, 60_000)) {
      return jsonError("Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring.", 429);
    }

    const seller = await requireSeller();
    const body = await req.json();
    const data = listingCreateSchema.parse(body);

    const [created] = await db
      .insert(listings)
      .values({
        ownerId: seller.id,
        title: data.title,
        description: data.description,
        dealType: data.dealType,
        propertyType: data.propertyType,
        regionId: data.regionId,
        districtId: data.districtId,
        address: data.address,
        lat: data.lat != null ? String(data.lat) : null,
        lng: data.lng != null ? String(data.lng) : null,
        price: String(data.price),
        currency: data.currency,
        isNegotiable: data.isNegotiable,
        area: String(data.area),
        rooms: data.rooms,
        floor: data.floor ?? null,
        maxFloors: data.maxFloors ?? null,
        amenities: data.amenities,
        videoUrl: data.videoUrl ?? null,
        status: "pending",
        plan: "standard",
      })
      .returning();

    if (data.images.length) {
      await db.insert(listingImages).values(
        data.images.map((url, index) => ({ listingId: created.id, url, sortOrder: index })),
      );
    }

    return NextResponse.json({ listing: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
