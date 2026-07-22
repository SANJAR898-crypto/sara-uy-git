import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { mapProperty } from "@/lib/mappers";
import { computeDetailedMatch } from "@/lib/ai/match";

export const dynamic = "force-dynamic";

/**
 * AI Match Engine — detailed, explainable match breakdown (budget, location,
 * rooms, amenities, distance proxy) between one property and the current
 * user's taste profile. Works for guests too (neutral baseline scores).
 */
export async function GET(req: NextRequest) {
  const propertyId = Number(req.nextUrl.searchParams.get("propertyId"));
  if (!Number.isFinite(propertyId)) return NextResponse.json({ error: "propertyId majburiy" }, { status: 400 });

  const rows = await db
    .select({ property: properties, seller: users })
    .from(properties)
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(eq(properties.id, propertyId))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "E'lon topilmadi" }, { status: 404 });

  const property = mapProperty(rows[0].property, rows[0].seller);

  const user = await getCurrentDbUser();
  let favoriteProperties: ReturnType<typeof mapProperty>[] = [];
  if (user) {
    const favRows = await db
      .select({ property: properties, seller: users })
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .innerJoin(users, eq(properties.sellerId, users.id))
      .where(eq(favorites.userId, user.id));
    favoriteProperties = favRows.map((r) => mapProperty(r.property, r.seller));
  }

  const match = computeDetailedMatch(property, favoriteProperties);
  return NextResponse.json({ match });
}
