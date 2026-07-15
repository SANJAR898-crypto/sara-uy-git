import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { getCurrentDbUser } from "@/lib/auth";
import { mapProperty } from "@/lib/mappers";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const list = await queryProperties({
    status: "active",
    category: params.get("category"),
    dealType: params.get("dealType"),
    city: params.get("city"),
    query: params.get("q"),
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : null,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : null,
    minRooms: params.get("minRooms") ? Number(params.get("minRooms")) : null,
    vipOnly: params.get("vip") === "1",
    sort: (params.get("sort") as "newest" | "price_asc" | "price_desc" | "views" | null) ?? "newest",
    limit: params.get("limit") ? Number(params.get("limit")) : 60,
  });

  return NextResponse.json({ properties: list });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["seller", "admin"].includes(user.role)) {
    return NextResponse.json({ error: "Faqat sotuvchilar e'lon joylashi mumkin" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const required = ["title", "category", "dealType", "price", "city", "district"];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `${field} majburiy` }, { status: 400 });
  }

  const [created] = await db
    .insert(properties)
    .values({
      title: String(body.title),
      description: String(body.description ?? ""),
      category: String(body.category),
      dealType: String(body.dealType),
      price: String(body.price),
      currency: body.currency === "UZS" ? "UZS" : "USD",
      city: String(body.city),
      district: String(body.district),
      address: body.address ?? null,
      lat: typeof body.lat === "number" ? body.lat : null,
      lng: typeof body.lng === "number" ? body.lng : null,
      rooms: Number(body.rooms ?? 1),
      area: Number(body.area ?? 0),
      floor: body.floor != null ? Number(body.floor) : null,
      totalFloors: body.totalFloors != null ? Number(body.totalFloors) : null,
      images: Array.isArray(body.images) && body.images.length ? body.images : ["/images/logo.png"],
      isVip: Boolean(body.isVip) && user.role === "admin",
      status: user.role === "admin" ? "active" : "pending",
      sellerId: user.id,
    })
    .returning();

  return NextResponse.json({ property: mapProperty(created, user) }, { status: 201 });
}
