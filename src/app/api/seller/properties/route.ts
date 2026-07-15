import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

export async function GET() {
  const seller = await requireRole(["seller", "admin"]);
  if (!seller) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const list = await queryProperties({
    sellerId: seller.id,
    status: ["pending", "active", "rejected", "archived"],
    sort: "newest",
    limit: 200,
  });

  return NextResponse.json({ properties: list });
}
