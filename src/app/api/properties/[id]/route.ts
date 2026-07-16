import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { mapProperty } from "@/lib/mappers";

export const dynamic = "force-dynamic";

async function loadProperty(id: number) {
  const rows = await db
    .select({ property: properties, seller: users })
    .from(properties)
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(eq(properties.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const row = await loadProperty(numId);
  if (!row) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json({ property: mapProperty(row.property, row.seller) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await loadProperty(numId);
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const isOwner = existing.property.sellerId === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  const editableFields = [
    "title",
    "description",
    "category",
    "dealType",
    "currency",
    "city",
    "district",
    "address",
    "rooms",
    "area",
    "floor",
    "totalFloors",
    "images",
    "lat",
    "lng",
  ];
  for (const field of editableFields) {
    if (body[field] !== undefined) patch[field] = body[field];
  }
  if (body.price !== undefined) patch.price = String(body.price);

  // Editing resets moderation status back to pending for non-admin sellers.
  if (isOwner && !isAdmin) patch.status = "pending";

  if (isAdmin) {
    if (body.status && ["pending", "active", "rejected", "archived"].includes(body.status)) {
      patch.status = body.status;
    }
    if (typeof body.isVip === "boolean") patch.isVip = body.isVip;
    if (typeof body.isVerified === "boolean") patch.isVerified = body.isVerified;
    if (typeof body.rejectionReason === "string") patch.rejectionReason = body.rejectionReason;
  }

  const [updated] = await db.update(properties).set(patch).where(eq(properties.id, numId)).returning();
  const seller = isOwner ? existing.seller : (await db.select().from(users).where(eq(users.id, updated.sellerId)))[0];

  // Notify the seller when an admin moderates their listing.
  if (isAdmin && !isOwner) {
    if (patch.status === "active" && existing.property.status !== "active") {
      await db.insert(notifications).values({
        userId: updated.sellerId,
        title: "E'lon tasdiqlandi ✅",
        message: `"${updated.title}" e'loningiz moderatsiyadan o'tdi va endi platformada ko'rinadi.`,
        type: "system",
      });
    } else if (patch.status === "rejected" && existing.property.status !== "rejected") {
      await db.insert(notifications).values({
        userId: updated.sellerId,
        title: "E'lon rad etildi",
        message: updated.rejectionReason
          ? `"${updated.title}" e'loningiz rad etildi. Sabab: ${updated.rejectionReason}`
          : `"${updated.title}" e'loningiz rad etildi.`,
        type: "system",
      });
    }
    if (patch.isVip === true && !existing.property.isVip) {
      await db.insert(notifications).values({
        userId: updated.sellerId,
        title: "VIP maqomi berildi ⭐",
        message: `"${updated.title}" e'loningiz endi VIP sifatida ko'rsatiladi.`,
        type: "vip",
      });
    }
  }

  return NextResponse.json({ property: mapProperty(updated, seller) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await loadProperty(numId);
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const isOwner = existing.property.sellerId === user.id;
  if (!isOwner && user.role !== "admin") return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  await db.delete(properties).where(eq(properties.id, numId));
  return NextResponse.json({ ok: true });
}
