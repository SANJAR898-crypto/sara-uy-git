import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { mapNotification } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ notifications: [] });

  const rows = await db
    .select()
    .from(notifications)
    .where(or(eq(notifications.userId, user.id), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json({ notifications: rows.map(mapNotification) });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (body.markAllRead) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
    return NextResponse.json({ ok: true });
  }

  const id = Number(body.id);
  if (Number.isFinite(id)) {
    // Only the notification's own recipient (or a global broadcast row,
    // userId = null) may be marked as read — never someone else's private
    // notification, even if its numeric ID is guessed.
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), or(eq(notifications.userId, user.id), isNull(notifications.userId))));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
}
