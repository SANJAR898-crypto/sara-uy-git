import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/admin";
import { setSellerPlan } from "@/lib/subscription";
import type { SubscriptionPlanKey } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status");

  const rows = await db
    .select({ payment: payments, seller: users })
    .from(payments)
    .innerJoin(users, eq(payments.sellerId, users.id))
    .orderBy(desc(payments.createdAt))
    .limit(200);

  const filtered = status && status !== "all" ? rows.filter((r) => r.payment.status === status) : rows;

  const [summary] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(amount) filter (where status = 'paid'), 0)::float`,
      pendingCount: sql<number>`count(*) filter (where status = 'pending')::int`,
      paidCount: sql<number>`count(*) filter (where status = 'paid')::int`,
      failedCount: sql<number>`count(*) filter (where status = 'failed')::int`,
      refundedCount: sql<number>`count(*) filter (where status = 'refunded')::int`,
    })
    .from(payments);

  return NextResponse.json({
    payments: filtered.map((r) => ({
      id: String(r.payment.id),
      sellerName: [r.seller.firstName, r.seller.lastName].filter(Boolean).join(" ") || r.seller.username,
      sellerId: String(r.seller.id),
      planKey: r.payment.planKey,
      amount: Number(r.payment.amount),
      currency: r.payment.currency,
      status: r.payment.status,
      method: r.payment.method,
      note: r.payment.note,
      createdAt: r.payment.createdAt,
      paidAt: r.payment.paidAt,
    })),
    summary,
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const sellerId = Number(body.sellerId);
  const planKey = typeof body.planKey === "string" ? body.planKey : "";
  const amount = Number(body.amount);

  if (!Number.isFinite(sellerId) || !planKey || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "sellerId, planKey, amount majburiy" }, { status: 400 });
  }

  const [created] = await db
    .insert(payments)
    .values({
      sellerId,
      planKey,
      amount: String(amount),
      currency: typeof body.currency === "string" ? body.currency : "UZS",
      method: typeof body.method === "string" ? body.method : "manual",
      note: typeof body.note === "string" ? body.note : null,
      status: "pending",
    })
    .returning();

  await logAudit({ actor: admin, action: "payment.create", targetType: "payment", targetId: created.id, metadata: { sellerId, planKey, amount }, req });

  return NextResponse.json({ payment: { id: String(created.id) } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const status = body.status;
  const allowed = ["pending", "paid", "failed", "refunded"];
  if (!Number.isFinite(id) || !allowed.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { status };
  if (status === "paid") patch.paidAt = new Date();

  const [updated] = await db.update(payments).set(patch).where(eq(payments.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  if (status === "paid") {
    await setSellerPlan(updated.sellerId, updated.planKey as SubscriptionPlanKey);
  }

  await logAudit({ actor: admin, action: "payment.status_change", targetType: "payment", targetId: id, metadata: { status }, req });

  return NextResponse.json({ ok: true });
}
