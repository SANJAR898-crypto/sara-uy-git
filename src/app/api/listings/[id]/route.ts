import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, listingImages, listings, users } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isAdminTelegramId } from "@/lib/admin";
import { listingUpdateSchema } from "@/lib/validation";

async function loadListing(id: number) {
  const [row] = await db
    .select({
      listing: listings,
      ownerId: users.id,
      ownerName: users.firstName,
      ownerLastName: users.lastName,
      ownerUsername: users.username,
      ownerAvatar: users.avatarUrl,
      ownerRating: users.sellerRating,
      ownerPhone: users.phoneNumber,
      ownerSince: users.sellerSince,
      ownerAgency: users.agencyName,
    })
    .from(listings)
    .innerJoin(users, eq(listings.ownerId, users.id))
    .where(eq(listings.id, id))
    .limit(1);

  if (!row) return null;

  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, id))
    .orderBy(asc(listingImages.sortOrder));

  return {
    ...row.listing,
    images: images.map((i) => i.url),
    owner: {
      id: row.ownerId,
      name: [row.ownerName, row.ownerLastName].filter(Boolean).join(" "),
      username: row.ownerUsername,
      avatarUrl: row.ownerAvatar,
      rating: row.ownerRating,
      phone: row.ownerPhone,
      sellerSince: row.ownerSince,
      agencyName: row.ownerAgency,
    },
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = Number(id);
    if (!Number.isFinite(listingId)) return jsonError("Noto'g'ri ID", 400);

    const listing = await loadListing(listingId);
    if (!listing) return jsonError("E'lon topilmadi", 404);

    const currentUser = await getCurrentUser();
    const isOwner = currentUser?.id === listing.ownerId;
    const isAdmin = isAdminTelegramId(currentUser?.telegramId);

    if (listing.status !== "approved" && !isOwner && !isAdmin) {
      return jsonError("E'lon topilmadi", 404);
    }

    let isFavorited = false;
    if (currentUser) {
      const [fav] = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, currentUser.id), eq(favorites.listingId, listingId)))
        .limit(1);
      isFavorited = !!fav;
    }

    return NextResponse.json({ listing, isFavorited });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = Number(id);
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Kirish talab qilinadi", 401);

    const [existing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!existing) return jsonError("E'lon topilmadi", 404);

    const isAdmin = isAdminTelegramId(currentUser.telegramId);
    if (existing.ownerId !== currentUser.id && !isAdmin) {
      return jsonError("Ruxsat berilmagan", 403);
    }

    const body = await req.json();

    if (isAdmin && (body.status || body.plan)) {
      const [updated] = await db
        .update(listings)
        .set({
          status: body.status ?? existing.status,
          rejectionReason: body.rejectionReason ?? existing.rejectionReason,
          plan: body.plan ?? existing.plan,
          updatedAt: new Date(),
        })
        .where(eq(listings.id, listingId))
        .returning();
      return NextResponse.json({ listing: updated });
    }

    const data = listingUpdateSchema.parse(body);
    const { images, ...rest } = data;

    const [updated] = await db
      .update(listings)
      .set({
        ...rest,
        price: rest.price != null ? String(rest.price) : undefined,
        area: rest.area != null ? String(rest.area) : undefined,
        lat: rest.lat != null ? String(rest.lat) : undefined,
        lng: rest.lng != null ? String(rest.lng) : undefined,
        status: existing.ownerId === currentUser.id ? "pending" : existing.status,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, listingId))
      .returning();

    if (images) {
      await db.delete(listingImages).where(eq(listingImages.listingId, listingId));
      if (images.length) {
        await db
          .insert(listingImages)
          .values(images.map((url, index) => ({ listingId, url, sortOrder: index })));
      }
    }

    return NextResponse.json({ listing: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = Number(id);
    const currentUser = await getCurrentUser();
    if (!currentUser) return jsonError("Kirish talab qilinadi", 401);

    const [existing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!existing) return jsonError("E'lon topilmadi", 404);

    const isAdmin = isAdminTelegramId(currentUser.telegramId);
    if (existing.ownerId !== currentUser.id && !isAdmin) {
      return jsonError("Ruxsat berilmagan", 403);
    }

    await db.delete(listings).where(eq(listings.id, listingId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
