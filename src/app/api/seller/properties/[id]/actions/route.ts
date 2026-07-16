import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { duplicateListing, ListingLimitError, performListingAction, type ListingAction } from "@/lib/listing-service";
import { mapProperty } from "@/lib/mappers";

export const dynamic = "force-dynamic";

const VALID_ACTIONS: ListingAction[] = [
  "archive",
  "pause",
  "activate",
  "renew",
  "mark_sold",
  "promote_vip",
  "promote_premium",
  "unpromote_vip",
  "unpromote_premium",
  "submit_for_review",
];

async function loadOwnedProperty(id: number, userId: number, isAdmin: boolean) {
  const rows = await db
    .select({ property: properties, seller: users })
    .from(properties)
    .innerJoin(users, eq(properties.sellerId, users.id))
    .where(eq(properties.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (row.property.sellerId !== userId && !isAdmin) return null;
  return row;
}

/**
 * Centralized "Quick Actions" endpoint for the seller platform — a single,
 * auditable place to Archive / Pause / Activate / Renew / Mark Sold /
 * Promote-to-VIP / Promote-to-Premium a listing, enforcing that a seller can
 * only ever modify their own listings (or an admin, any listing).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await loadOwnedProperty(numId, user.id, user.role === "admin");
  if (!row) return NextResponse.json({ error: "Ruxsat yo'q yoki topilmadi" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "") as ListingAction;
  if (!VALID_ACTIONS.includes(action)) return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });

  try {
    const updated = await performListingAction(row.property, row.seller, action);
    return NextResponse.json({ property: mapProperty(updated, row.seller) });
  } catch (err) {
    if (err instanceof ListingLimitError) return NextResponse.json({ error: err.message }, { status: 402 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "Xatolik yuz berdi" }, { status: 400 });
  }
}

/** Duplicates a listing as a new draft the seller can review before publishing. */
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await loadOwnedProperty(numId, user.id, user.role === "admin");
  if (!row) return NextResponse.json({ error: "Ruxsat yo'q yoki topilmadi" }, { status: 403 });

  const duplicated = await duplicateListing(row.property);
  return NextResponse.json({ property: mapProperty(duplicated, row.seller) }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await loadOwnedProperty(numId, user.id, user.role === "admin");
  if (!row) return NextResponse.json({ error: "Ruxsat yo'q yoki topilmadi" }, { status: 403 });

  await db.delete(properties).where(eq(properties.id, numId));
  return NextResponse.json({ ok: true });
}
