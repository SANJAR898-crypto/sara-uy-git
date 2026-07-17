import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { desc, eq, isNull } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const rows = await db.select().from(notifications).where(isNull(notifications.userId)).orderBy(desc(notifications.createdAt)).limit(50);

  return NextResponse.json({
    broadcasts: rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      message: r.message,
      type: r.type,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const type = typeof body.type === "string" ? body.type : "system";
  const audience: "all" | "sellers" | "users" = ["all", "sellers", "users"].includes(body.audience)
    ? body.audience
    : "all";

  if (!title || !message) {
    return NextResponse.json({ error: "title va message majburiy" }, { status: 400 });
  }

  let recipientCount = 0;

  if (audience === "all") {
    // A single userId=null row is broadcast to every user (see GET /api/notifications).
    await db.insert(notifications).values({ userId: null, title, message, type });
    const [{ count }] = await db.select({ count: users.id }).from(users);
    recipientCount = count ? 1 : 0; // logical broadcast row, but conceptually reaches all users
  } else {
    const role = audience === "sellers" ? "seller" : "user";
    const targetUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, role));
    if (targetUsers.length > 0) {
      await db.insert(notifications).values(targetUsers.map((u) => ({ userId: u.id, title, message, type })));
    }
    recipientCount = targetUsers.length;
  }

  await logAudit({
    actor: admin,
    action: "notification.broadcast",
    targetType: "notification",
    metadata: { audience, title, recipientCount },
    req,
  });

  return NextResponse.json({ ok: true, recipientCount }, { status: 201 });
}
