import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { mapProperty } from "@/lib/mappers";
import { recommendProperties } from "@/lib/ai";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

/**
 * AI Recommendation Engine — surfaces listings tailored to the signed-in
 * user's taste profile derived from their favorites (category, city, price,
 * room-count affinity). Falls back to trending VIP listings for new users.
 */
export async function GET() {
  const user = await getCurrentDbUser();
  const active = await queryProperties({ status: "active", sort: "newest", limit: 200 });

  if (!user) {
    const fallback = active
      .slice()
      .sort((a, b) => Number(b.isVip) - Number(a.isVip) || b.views - a.views)
      .slice(0, 10)
      .map((p) => ({ ...p, matchScore: 50 }));
    return NextResponse.json({ recommendations: fallback });
  }

  const favRows = await db
    .select({ property: properties, seller: users })
    .from(favorites)
    .innerJoin(properties, eq(favorites.propertyId, properties.id))
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(eq(favorites.userId, user.id));

  const favProperties = favRows.map((r) => mapProperty(r.property, r.seller));
  const recommendations = recommendProperties(active, favProperties, 10);

  return NextResponse.json({ recommendations });
}
