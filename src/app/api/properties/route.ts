import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { getCurrentDbUser } from "@/lib/auth";
import { mapProperty } from "@/lib/mappers";
import { queryProperties } from "@/lib/properties-query";
import { smartRankProperties } from "@/lib/ai";
import { assertWithinListingLimits, ListingLimitError } from "@/lib/listing-service";
import { validateListingCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";

// Very small in-memory sliding-window limiter to curb listing-creation spam.
// Fine for a single-instance deployment; resets on redeploy.
const createAttempts = new Map<number, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(userId: number) {
  const now = Date.now();
  const attempts = (createAttempts.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  attempts.push(now);
  createAttempts.set(userId, attempts);
  return attempts.length > RATE_LIMIT_MAX;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const query = params.get("q");
  const smart = params.get("smart") === "1";

  const list = await queryProperties({
    status: "active",
    category: params.get("category"),
    dealType: params.get("dealType"),
    city: params.get("city"),
    query,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : null,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : null,
    minRooms: params.get("minRooms") ? Number(params.get("minRooms")) : null,
    vipOnly: params.get("vip") === "1",
    sort: (params.get("sort") as "newest" | "price_asc" | "price_desc" | "views" | null) ?? "newest",
    limit: params.get("limit") ? Number(params.get("limit")) : 60,
  });

  // AI Search: re-rank results by relevance/popularity/freshness instead of
  // plain chronological order when the client opts in with `smart=1`.
  const finalList = smart ? smartRankProperties(list, { query }) : list;

  return NextResponse.json({ properties: finalList });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["seller", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Faqat sotuvchilar e'lon joylashi mumkin" }, { status: 403 });
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json({ error: "Juda ko'p urinish. Birozdan so'ng qayta urining." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const asDraft = Boolean(body.asDraft);

  // Drafts skip strict validation (the wizard may be mid-flow); anything
  // submitted for real review must pass full validation.
  if (!asDraft) {
    const validation = validateListingCreate(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  } else if (!body.title) {
    return NextResponse.json({ error: "title majburiy" }, { status: 400 });
  }

  if (user.role !== "admin" && !asDraft) {
    try {
      await assertWithinListingLimits(user.id, "listing");
    } catch (err) {
      if (err instanceof ListingLimitError) return NextResponse.json({ error: err.message }, { status: 402 });
      throw err;
    }
  }

  const [created] = await db
    .insert(properties)
    .values({
      title: String(body.title),
      description: String(body.description ?? ""),
      category: String(body.category ?? "apartment"),
      dealType: String(body.dealType ?? "sale"),
      price: String(body.price ?? 0),
      currency: body.currency === "UZS" ? "UZS" : "USD",
      city: String(body.city ?? ""),
      district: String(body.district ?? ""),
      address: body.address ?? null,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      nearbyPlaces: Array.isArray(body.nearbyPlaces) ? body.nearbyPlaces : [],
      rooms: Number(body.rooms ?? 1),
      area: Number(body.area ?? 0),
      floor: body.floor != null ? Number(body.floor) : null,
      totalFloors: body.totalFloors != null ? Number(body.totalFloors) : null,
      bathrooms: body.bathrooms != null ? Number(body.bathrooms) : null,
      kitchenArea: body.kitchenArea != null ? Number(body.kitchenArea) : null,
      yearBuilt: body.yearBuilt != null ? Number(body.yearBuilt) : null,
      heating: body.heating ?? null,
      furniture: body.furniture ?? null,
      repairStatus: body.repairStatus ?? null,
      amenities: body.amenities && typeof body.amenities === "object" ? body.amenities : {},
      negotiable: Boolean(body.negotiable),
      installment: Boolean(body.installment),
      mortgage: Boolean(body.mortgage),
      rentPeriod: body.rentPeriod ?? null,
      serviceFee: body.serviceFee != null ? String(body.serviceFee) : null,
      contactPhone: body.contactPhone ?? null,
      contactTelegram: body.contactTelegram ?? null,
      hidePhone: Boolean(body.hidePhone),
      preferredContactTime: body.preferredContactTime ?? null,
      images: Array.isArray(body.images) && body.images.length ? body.images : ["/images/logo.png"],
      isVip: Boolean(body.isVip) && user.role === "admin",
      status: asDraft ? "draft" : user.role === "admin" ? "active" : "pending",
      expiresAt: asDraft ? null : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      sellerId: user.id,
    })
    .returning();

  return NextResponse.json({ property: mapProperty(created, user) }, { status: 201 });
}
