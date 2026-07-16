import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAllPlans, setSellerPlan } from "@/lib/subscription";
import { getSellerSubscriptionInfo } from "@/lib/seller-stats";
import type { SubscriptionPlanKey } from "@/types";

export const dynamic = "force-dynamic";

const VALID_KEYS: SubscriptionPlanKey[] = ["free", "vip", "premium", "agency", "developer"];

export async function GET() {
  const seller = await requireRole(["seller", "admin"]);
  if (!seller) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const [plans, current] = await Promise.all([getAllPlans(), getSellerSubscriptionInfo(seller.id)]);
  return NextResponse.json({ plans, current });
}

/**
 * Switches the seller's plan. There is no real payment gateway wired up yet
 * (revenue-ready structure only, per Phase 4 scope) — this activates the
 * plan immediately, which is suitable for demo / admin-granted upgrades.
 */
export async function POST(req: NextRequest) {
  const seller = await requireRole(["seller", "admin"]);
  if (!seller) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const key = String(body.planKey ?? "");
  if (!VALID_KEYS.includes(key as SubscriptionPlanKey)) {
    return NextResponse.json({ error: "Noto'g'ri tarif" }, { status: 400 });
  }

  await setSellerPlan(seller.id, key as SubscriptionPlanKey);
  const current = await getSellerSubscriptionInfo(seller.id);
  return NextResponse.json({ current });
}
