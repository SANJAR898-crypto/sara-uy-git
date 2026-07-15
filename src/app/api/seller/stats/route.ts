import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireSeller } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const seller = await requireSeller();

    const [row] = await db
      .select({
        totalListings: sql<number>`count(*)::int`,
        approvedListings: sql<number>`count(*) filter (where ${listings.status} = 'approved')::int`,
        pendingListings: sql<number>`count(*) filter (where ${listings.status} = 'pending')::int`,
        totalViews: sql<number>`coalesce(sum(${listings.viewsCount}), 0)::int`,
        totalFavorites: sql<number>`coalesce(sum(${listings.favoritesCount}), 0)::int`,
        totalCalls: sql<number>`coalesce(sum(${listings.callsCount}), 0)::int`,
        totalTelegramClicks: sql<number>`coalesce(sum(${listings.telegramClicksCount}), 0)::int`,
      })
      .from(listings)
      .where(eq(listings.ownerId, seller.id));

    return NextResponse.json({ stats: row });
  } catch (error) {
    return handleApiError(error);
  }
}
