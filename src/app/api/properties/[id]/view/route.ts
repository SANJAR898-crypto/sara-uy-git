import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, properties } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { logPropertyEvent } from "@/lib/seller-stats";

export const dynamic = "force-dynamic";

// View-count milestones that trigger a one-off congratulatory notification
// to the seller (per the Phase 4 "New View Milestone" requirement).
const MILESTONES = [50, 100, 500, 1000, 5000];

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const [updated] = await db
    .update(properties)
    .set({ views: sql`${properties.views} + 1` })
    .where(eq(properties.id, numId))
    .returning({ views: properties.views, sellerId: properties.sellerId, title: properties.title });

  if (!updated) return NextResponse.json({ views: 0 });

  await logPropertyEvent(numId, "view");

  if (MILESTONES.includes(updated.views)) {
    await db.insert(notifications).values({
      userId: updated.sellerId,
      title: `${updated.views} ta ko'rish! 🎉`,
      message: `"${updated.title}" e'loningiz ${updated.views} marta ko'rildi.`,
      type: "view_milestone",
    });
  }

  return NextResponse.json({ views: updated.views });
}
