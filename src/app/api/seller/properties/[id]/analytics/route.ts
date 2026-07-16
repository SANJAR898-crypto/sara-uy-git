import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import { getListingAnalytics } from "@/lib/seller-stats";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db.select().from(properties).where(eq(properties.id, numId)).limit(1);
  if (!row) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  if (row.sellerId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const analytics = await getListingAnalytics(numId);
  return NextResponse.json({ analytics });
}
