import { NextResponse } from "next/server";
import { db } from "@/db";
import { listingImages, listings } from "@/db/schema";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireSeller } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const seller = await requireSeller();

    const rows = await db
      .select()
      .from(listings)
      .where(eq(listings.ownerId, seller.id))
      .orderBy(desc(listings.createdAt));

    const listingIds = rows.map((r) => r.id);
    const images = listingIds.length
      ? await db
          .select()
          .from(listingImages)
          .where(inArray(listingImages.listingId, listingIds))
          .orderBy(asc(listingImages.sortOrder))
      : [];

    const items = rows.map((r) => ({
      ...r,
      images: images.filter((i) => i.listingId === r.id).map((i) => i.url),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
