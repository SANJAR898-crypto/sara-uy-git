import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, reports } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireUser } from "@/lib/auth-helpers";
import { reportCreateSchema } from "@/lib/validation";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!rateLimit(getClientKey(req, "report"), 10, 60_000)) {
      return jsonError("Juda ko'p urinish", 429);
    }

    const { id } = await params;
    const listingId = Number(id);
    const user = await requireUser();
    const body = await req.json();
    const data = reportCreateSchema.parse({ ...body, listingId });

    await db.insert(reports).values({
      listingId,
      reporterId: user.id,
      reason: data.reason,
      description: data.description,
    });

    await db
      .update(listings)
      .set({ reportsCount: sql`${listings.reportsCount} + 1` })
      .where(eq(listings.id, listingId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
