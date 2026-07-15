import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");
  const list = await queryProperties({
    status: status && status !== "all" ? status : ["pending", "active", "rejected", "archived"],
    limit: 200,
    sort: "newest",
  });

  return NextResponse.json({ properties: list });
}
