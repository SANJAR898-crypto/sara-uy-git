import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, properties } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { logPropertyEvent } from "@/lib/seller-stats";
import { isRateLimited } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["telegram", "phone", "message"] as const;
type ContactType = (typeof VALID_TYPES)[number];

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Logs a "contact" interaction (Telegram click, phone call tap, or message
 * button) from the public listing page — powers the seller dashboard's
 * Telegram Contacts / Phone Calls / Messages counters and triggers a
 * "New Contact" notification for the seller.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const type = String(body.type ?? "") as ContactType;
  if (!VALID_TYPES.includes(type)) return NextResponse.json({ error: "Noto'g'ri tur" }, { status: 400 });

  // Public, unauthenticated endpoint — throttle per IP+listing to stop
  // engagement-counter spam without affecting real visitors.
  if (isRateLimited(`contact.${numId}`, clientIp(req), 20, 60_000)) {
    return NextResponse.json({ error: "Juda ko'p urinish. Birozdan so'ng qayta urining." }, { status: 429 });
  }

  let updated;
  if (type === "telegram") {
    [updated] = await db
      .update(properties)
      .set({ telegramContacts: sql`${properties.telegramContacts} + 1` })
      .where(eq(properties.id, numId))
      .returning();
  } else if (type === "phone") {
    [updated] = await db
      .update(properties)
      .set({ phoneCalls: sql`${properties.phoneCalls} + 1` })
      .where(eq(properties.id, numId))
      .returning();
  } else {
    [updated] = await db
      .update(properties)
      .set({ messagesCount: sql`${properties.messagesCount} + 1` })
      .where(eq(properties.id, numId))
      .returning();
  }

  if (!updated) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await logPropertyEvent(numId, type);

  const typeLabel = type === "telegram" ? "Telegram orqali" : type === "phone" ? "Telefon orqali" : "Xabar orqali";
  await db.insert(notifications).values({
    userId: updated.sellerId,
    title: "Yangi murojaat 📞",
    message: `"${updated.title}" e'loningizga ${typeLabel} murojaat bo'ldi.`,
    type: "contact",
  });

  return NextResponse.json({ ok: true });
}
