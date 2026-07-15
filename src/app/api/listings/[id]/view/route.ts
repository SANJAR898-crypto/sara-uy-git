import { NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents, listings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const listingId = Number(id);
    if (!Number.isFinite(listingId)) return jsonError("Noto'g'ri ID", 400);

    const user = await getCurrentUser();

    await db
      .update(listings)
      .set({ viewsCount: sql`${listings.viewsCount} + 1` })
      .where(eq(listings.id, listingId));

    await db.insert(analyticsEvents).values({
      eventType: "view",
      listingId,
      userId: user?.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
