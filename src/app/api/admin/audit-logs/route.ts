import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, listAuditLogs } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const limitParam = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 500) : 150;

  const rows = await listAuditLogs(limit);

  return NextResponse.json({
    logs: rows.map((r) => ({
      id: String(r.id),
      actorName: r.actorName,
      actorTelegramId: r.actorTelegramId,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId,
      metadata: r.metadata,
      ip: r.ip,
      createdAt: r.createdAt,
    })),
  });
}
