import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { featureFlags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, getAllFlags, logAudit } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const flags = await getAllFlags();
  return NextResponse.json({
    flags: flags.map((f) => ({
      id: String(f.id),
      key: f.key,
      label: f.label,
      description: f.description,
      enabled: f.enabled,
      updatedAt: f.updatedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const key = typeof body.key === "string" ? body.key.trim() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!key || !label) return NextResponse.json({ error: "key va label majburiy" }, { status: 400 });

  const existing = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
  let result;
  if (existing.length > 0) {
    [result] = await db
      .update(featureFlags)
      .set({
        label,
        description: typeof body.description === "string" ? body.description : existing[0].description,
        enabled: typeof body.enabled === "boolean" ? body.enabled : existing[0].enabled,
        updatedAt: new Date(),
        updatedBy: admin.id,
      })
      .where(eq(featureFlags.key, key))
      .returning();
  } else {
    [result] = await db
      .insert(featureFlags)
      .values({
        key,
        label,
        description: typeof body.description === "string" ? body.description : null,
        enabled: Boolean(body.enabled),
        updatedBy: admin.id,
      })
      .returning();
  }

  await logAudit({ actor: admin, action: "flag.upsert", targetType: "flag", targetId: key, metadata: { enabled: result.enabled }, req });

  return NextResponse.json({ flag: { id: String(result.id), key: result.key, label: result.label, enabled: result.enabled } });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!Number.isFinite(id) || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const [updated] = await db
    .update(featureFlags)
    .set({ enabled: body.enabled, updatedAt: new Date(), updatedBy: admin.id })
    .where(eq(featureFlags.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await logAudit({
    actor: admin,
    action: "flag.toggle",
    targetType: "flag",
    targetId: updated.key,
    metadata: { enabled: updated.enabled },
    req,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  await db.delete(featureFlags).where(eq(featureFlags.id, id));
  await logAudit({ actor: admin, action: "flag.delete", targetType: "flag", targetId: id, req });

  return NextResponse.json({ ok: true });
}
