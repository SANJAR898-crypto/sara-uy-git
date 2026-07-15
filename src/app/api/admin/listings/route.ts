import { NextResponse } from "next/server";
import { db } from "@/db";
import { listingImages, listings, users } from "@/db/schema";
import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(listings.status, status));

    const rows = await db
      .select({
        listing: listings,
        ownerName: users.firstName,
        ownerUsername: users.username,
        ownerTelegramId: users.telegramId,
      })
      .from(listings)
      .innerJoin(users, eq(listings.ownerId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(listings.createdAt));

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
      owner: { name: r.ownerName, username: r.ownerUsername, telegramId: r.ownerTelegramId },
      images: images.filter((i) => i.listingId === r.listing.id).map((i) => i.url),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
