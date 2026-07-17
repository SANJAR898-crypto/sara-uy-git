import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, reports, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/admin";
import { getCurrentDbUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");

  const rows = await db
    .select({ report: reports, reporter: users })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt))
    .limit(200);

  const filtered = status && status !== "all" ? rows.filter((r) => r.report.status === status) : rows;

  return NextResponse.json({
    reports: filtered.map((r) => ({
      id: String(r.report.id),
      reporterName: r.reporter
        ? [r.reporter.firstName, r.reporter.lastName].filter(Boolean).join(" ") || r.reporter.username
        : "Noma'lum",
      targetType: r.report.targetType,
      targetId: r.report.targetId,
      reason: r.report.reason,
      details: r.report.details,
      status: r.report.status,
      createdAt: r.report.createdAt,
      resolvedAt: r.report.resolvedAt,
    })),
  });
}

/** Public-facing report creation — any authenticated user can flag content. */
export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const targetType = body.targetType === "user" ? "user" : "property";
  const targetId = Number(body.targetId);
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 200) : "";

  if (!Number.isFinite(targetId) || !reason) {
    return NextResponse.json({ error: "targetId va reason majburiy" }, { status: 400 });
  }

  if (targetType === "property") {
    const exists = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, targetId)).limit(1);
    if (exists.length === 0) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const [created] = await db
    .insert(reports)
    .values({
      reporterId: user.id,
      targetType,
      targetId,
      reason,
      details: typeof body.details === "string" ? body.details.slice(0, 1000) : null,
    })
    .returning();

  return NextResponse.json({ report: { id: String(created.id) } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const status = body.status;
  const allowed = ["open", "reviewing", "resolved", "dismissed"];
  if (!Number.isFinite(id) || !allowed.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { status };
  if (status === "resolved" || status === "dismissed") {
    patch.resolvedBy = admin.id;
    patch.resolvedAt = new Date();
  }

  const [updated] = await db.update(reports).set(patch).where(eq(reports.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await logAudit({ actor: admin, action: "report.status_change", targetType: "report", targetId: id, metadata: { status }, req });

  return NextResponse.json({ ok: true });
}
