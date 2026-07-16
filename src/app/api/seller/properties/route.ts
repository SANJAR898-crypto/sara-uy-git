import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

const ALL_STATUSES = ["draft", "pending", "active", "paused", "rejected", "archived", "expired", "sold"];

export async function GET(req: NextRequest) {
  const seller = await requireRole(["seller", "admin"]);
  if (!seller) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const statusParam = req.nextUrl.searchParams.get("status");

  const list = await queryProperties({
    sellerId: seller.id,
    status: statusParam && statusParam !== "all" ? statusParam : ALL_STATUSES,
    sort: "newest",
    limit: 200,
  });

  return NextResponse.json({ properties: list });
}
