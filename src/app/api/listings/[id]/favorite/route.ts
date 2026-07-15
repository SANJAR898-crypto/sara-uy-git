import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, listings } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = Number(id);
    if (!Number.isFinite(listingId)) return jsonError("Noto'g'ri ID", 400);

    const user = await requireUser();

    const inserted = await db
      .insert(favorites)
      .values({ userId: user.id, listingId })
      .onConflictDoNothing()
      .returning();

    if (inserted.length > 0) {
      await db
        .update(listings)
        .set({ favoritesCount: sql`${listings.favoritesCount} + 1` })
        .where(eq(listings.id, listingId));
    }

    return NextResponse.json({ favorited: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = Number(id);
    if (!Number.isFinite(listingId)) return jsonError("Noto'g'ri ID", 400);

    const user = await requireUser();

    const deleted = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.listingId, listingId)))
      .returning();

    if (deleted.length > 0) {
      await db
        .update(listings)
        .set({ favoritesCount: sql`greatest(${listings.favoritesCount} - 1, 0)` })
        .where(eq(listings.id, listingId));
    }

    return NextResponse.json({ favorited: false });
  } catch (error) {
    return handleApiError(error);
  }
}
