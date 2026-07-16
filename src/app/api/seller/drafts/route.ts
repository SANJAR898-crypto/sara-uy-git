import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listingDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET the seller's single in-progress wizard draft (autosave / restore). */
export async function GET() {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ draft: null });

  const rows = await db.select().from(listingDrafts).where(eq(listingDrafts.sellerId, user.id)).limit(1);
  if (rows.length === 0) return NextResponse.json({ draft: null });

  const row = rows[0];
  return NextResponse.json({
    draft: { step: row.step, data: row.data, updatedAt: row.updatedAt },
  });
}

/** Upserts the seller's wizard draft (debounced autosave from the client). */
export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const step = Number.isFinite(Number(body.step)) ? Number(body.step) : 1;
  const data = body.data && typeof body.data === "object" ? body.data : {};

  const existing = await db.select({ id: listingDrafts.id }).from(listingDrafts).where(eq(listingDrafts.sellerId, user.id)).limit(1);

  if (existing.length > 0) {
    await db
      .update(listingDrafts)
      .set({ step, data, updatedAt: new Date() })
      .where(eq(listingDrafts.sellerId, user.id));
  } else {
    await db.insert(listingDrafts).values({ sellerId: user.id, step, data });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.delete(listingDrafts).where(eq(listingDrafts.sellerId, user.id));
  return NextResponse.json({ ok: true });
}
