import { NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries, listings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth-helpers";
import { inquiryCreateSchema } from "@/lib/validation";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!rateLimit(getClientKey(req, "contact"), 30, 60_000)) {
      return jsonError("Juda ko'p urinish", 429);
    }

    const { id } = await params;
    const listingId = Number(id);
    const body = await req.json();
    const data = inquiryCreateSchema.parse({ ...body, listingId });

    const user = await getCurrentUser();

    await db.insert(inquiries).values({
      listingId,
      userId: user?.id,
      contactType: data.contactType,
      message: data.message,
    });

    if (data.contactType === "call") {
      await db
        .update(listings)
        .set({ callsCount: sql`${listings.callsCount} + 1` })
        .where(eq(listings.id, listingId));
    } else if (data.contactType === "telegram") {
      await db
        .update(listings)
        .set({ telegramClicksCount: sql`${listings.telegramClicksCount} + 1` })
        .where(eq(listings.id, listingId));
    } else {
      await db
        .update(listings)
        .set({ sharesCount: sql`${listings.sharesCount} + 1` })
        .where(eq(listings.id, listingId));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
