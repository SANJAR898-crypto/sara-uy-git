import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, listingImages, listings } from "@/db/schema";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireUser();

    const rows = await db
      .select({ favorite: favorites, listing: listings })
      .from(favorites)
      .innerJoin(listings, eq(favorites.listingId, listings.id))
      .where(eq(favorites.userId, user.id))
      .orderBy(desc(favorites.createdAt));

    const listingIds = rows.map((r) => r.listing.id);
    const images = listingIds.length
      ? await db
          .select()
          .from(listingImages)
          .where(inArray(listingImages.listingId, listingIds))
          .orderBy(asc(listingImages.sortOrder))
      : [];

    const items = rows.map((r) => ({
      ...r.listing,
      favoritedAt: r.favorite.createdAt,
      images: images.filter((i) => i.listingId === r.listing.id).map((i) => i.url),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
