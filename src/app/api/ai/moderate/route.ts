import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { evaluatePropertyWithAi, getPropertyTrustSnapshot } from "@/lib/ai/trust";

export const dynamic = "force-dynamic";

/**
 * AI Moderator + AI Fraud Detector — GET reads the last computed trust
 * snapshot for a listing (sellers can check their own; admins can check
 * any). POST forces a fresh re-evaluation (admin only).
 */
export async function GET(req: NextRequest) {
  const propertyId = Number(req.nextUrl.searchParams.get("propertyId"));
  if (!Number.isFinite(propertyId)) return NextResponse.json({ error: "propertyId majburiy" }, { status: 400 });

  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "admin") {
    const rows = await db.select({ sellerId: properties.sellerId }).from(properties).where(eq(properties.id, propertyId)).limit(1);
    if (!rows[0] || rows[0].sellerId !== user.id) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const snapshot = await getPropertyTrustSnapshot(propertyId);
  return NextResponse.json({ snapshot });
}

export async function POST(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const propertyId = Number(body?.propertyId);
  if (!Number.isFinite(propertyId)) return NextResponse.json({ error: "propertyId majburiy" }, { status: 400 });

  const result = await evaluatePropertyWithAi(propertyId);
  if (!result) return NextResponse.json({ error: "E'lon topilmadi" }, { status: 404 });

  return NextResponse.json(result);
}
