import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { mapStory } from "@/lib/mappers";
import { logAudit } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const rows = await db.select().from(stories).orderBy(asc(stories.sortOrder));
  return NextResponse.json({ stories: rows.map((r) => mapStory(r, false)) });
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (!body?.name || !body?.avatarUrl || !body?.imageUrl) {
    return NextResponse.json({ error: "name, avatarUrl, imageUrl majburiy" }, { status: 400 });
  }

  const [{ maxOrder } = { maxOrder: 0 }] = await db
    .select({ maxOrder: stories.sortOrder })
    .from(stories)
    .orderBy(asc(stories.sortOrder));

  const [created] = await db
    .insert(stories)
    .values({
      name: String(body.name),
      avatarUrl: String(body.avatarUrl),
      imageUrl: String(body.imageUrl),
      isVip: Boolean(body.isVip),
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : (maxOrder ?? 0) + 1,
    })
    .returning();

  await logAudit({ actor: admin, action: "story.create", targetType: "story", targetId: created.id, req });

  return NextResponse.json({ story: mapStory(created, false) }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  await db.delete(stories).where(eq(stories.id, id));
  await logAudit({ actor: admin, action: "story.delete", targetType: "story", targetId: id, req });
  return NextResponse.json({ ok: true });
}
