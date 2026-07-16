import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSellerDashboardStats } from "@/lib/seller-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const seller = await requireRole(["seller", "admin"]);
  if (!seller) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const stats = await getSellerDashboardStats(seller.id);
  return NextResponse.json(stats);
}
