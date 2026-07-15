import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200);
  return NextResponse.json({
    users: rows.map((u) => ({
      id: String(u.id),
      telegramId: u.telegramId,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || "Foydalanuvchi",
      username: u.username,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (["user", "seller", "admin"].includes(body.role)) patch.role = body.role;
  if (typeof body.isVerified === "boolean") patch.isVerified = body.isVerified;

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Bo'sh so'rov" }, { status: 400 });

  await db.update(users).set(patch).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
