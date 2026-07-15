import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, properties, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { mapProperty } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ favoriteIds: [], properties: [] });

  const rows = await db
    .select({ property: properties, seller: users })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(eq(favorites.userId, user.id))
    .orderBy(favorites.createdAt);

  const mapped = rows.map((r) => mapProperty(r.property, r.seller));
  return NextResponse.json({ favoriteIds: mapped.map((p) => p.id), properties: mapped });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const propertyId = Number(body.propertyId);
  if (!Number.isFinite(propertyId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.propertyId, propertyId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    return NextResponse.json({ favorited: false });
  }

  await db.insert(favorites).values({ userId: user.id, propertyId });
  return NextResponse.json({ favorited: true });
}
