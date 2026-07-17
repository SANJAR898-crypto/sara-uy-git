import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getAllSettings, setSetting, logAudit } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const settings = await getAllSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key || body.value === undefined) {
    return NextResponse.json({ error: "key va value majburiy" }, { status: 400 });
  }

  const updated = await setSetting(key, body.value, admin.id);

  await logAudit({ actor: admin, action: "settings.update", targetType: "settings", targetId: key, metadata: { value: body.value }, req });

  return NextResponse.json({ setting: { key: updated.key, value: updated.value } });
}
