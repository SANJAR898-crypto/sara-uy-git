import { db } from "@/db";
import { sellerSubscriptions, subscriptionPlans } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { SubscriptionPlan, SubscriptionPlanKey } from "@/types";

/**
 * Default plan catalogue. Seeded into `subscription_plans` on first read so the
 * database stays the single source of truth, while giving the platform sane
 * defaults out of the box (revenue-ready structure per Phase 4 spec).
 */
export const DEFAULT_PLANS: Record<SubscriptionPlanKey, Omit<SubscriptionPlan, "key"> & { key: SubscriptionPlanKey }> = {
  free: {
    key: "free",
    name: "Bepul",
    maxListings: 3,
    maxVipListings: 0,
    maxPremiumListings: 0,
    maxImagesPerListing: 6,
    priceMonthly: 0,
    durationDays: 30,
    features: ["3 tagacha e'lon", "Standart ko'rinish", "Asosiy statistika"],
  },
  vip: {
    key: "vip",
    name: "VIP",
    maxListings: 15,
    maxVipListings: 3,
    maxPremiumListings: 0,
    maxImagesPerListing: 15,
    priceMonthly: 9.99,
    durationDays: 30,
    features: ["15 tagacha e'lon", "3 ta VIP e'lon", "Qidiruvda yuqorida", "Kengaytirilgan statistika"],
  },
  premium: {
    key: "premium",
    name: "Premium",
    maxListings: 40,
    maxVipListings: 8,
    maxPremiumListings: 5,
    maxImagesPerListing: 25,
    priceMonthly: 24.99,
    durationDays: 30,
    features: ["40 tagacha e'lon", "8 ta VIP + 5 ta Premium", "Premium belgi", "To'liq analitika", "AI yordamchi"],
  },
  agency: {
    key: "agency",
    name: "Agentlik",
    maxListings: 150,
    maxVipListings: 25,
    maxPremiumListings: 15,
    maxImagesPerListing: 30,
    priceMonthly: 79.99,
    durationDays: 30,
    features: ["150 tagacha e'lon", "Jamoaviy boshqaruv", "Agentlik profili", "Ustuvor qo'llab-quvvatlash"],
  },
  developer: {
    key: "developer",
    name: "Quruvchi",
    maxListings: 500,
    maxVipListings: 60,
    maxPremiumListings: 40,
    maxImagesPerListing: 40,
    priceMonthly: 199.99,
    durationDays: 30,
    features: ["500 tagacha e'lon", "Loyihalar sahifasi", "Maxsus quruvchi profili", "Shaxsiy menejer"],
  },
};

export async function ensurePlansSeeded() {
  const existing = await db.select({ key: subscriptionPlans.key }).from(subscriptionPlans).limit(1);
  if (existing.length > 0) return;

  await db.insert(subscriptionPlans).values(
    Object.values(DEFAULT_PLANS).map((plan, i) => ({
      key: plan.key,
      name: plan.name,
      maxListings: plan.maxListings,
      maxVipListings: plan.maxVipListings,
      maxPremiumListings: plan.maxPremiumListings,
      maxImagesPerListing: plan.maxImagesPerListing,
      priceMonthly: String(plan.priceMonthly),
      durationDays: plan.durationDays,
      features: plan.features,
      sortOrder: i,
    }))
  );
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  await ensurePlansSeeded();
  const rows = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
  return rows.map((r) => ({
    key: r.key as SubscriptionPlanKey,
    name: r.name,
    maxListings: r.maxListings,
    maxVipListings: r.maxVipListings,
    maxPremiumListings: r.maxPremiumListings,
    maxImagesPerListing: r.maxImagesPerListing,
    priceMonthly: Number(r.priceMonthly),
    durationDays: r.durationDays,
    features: r.features,
  }));
}

export async function getPlanByKey(key: string): Promise<SubscriptionPlan> {
  const plans = await getAllPlans();
  return plans.find((p) => p.key === key) ?? plans.find((p) => p.key === "free")!;
}

/** Ensures a seller always has an active subscription row (defaults to Free). */
export async function ensureSellerSubscription(sellerId: number) {
  const existing = await db
    .select()
    .from(sellerSubscriptions)
    .where(eq(sellerSubscriptions.sellerId, sellerId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(sellerSubscriptions)
    .values({ sellerId, planKey: "free", status: "active" })
    .returning();
  return created;
}

export async function getSellerSubscriptionRow(sellerId: number) {
  return ensureSellerSubscription(sellerId);
}

export async function setSellerPlan(sellerId: number, planKey: SubscriptionPlanKey) {
  const plan = await getPlanByKey(planKey);
  const expiresAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

  await ensureSellerSubscription(sellerId);
  const [updated] = await db
    .update(sellerSubscriptions)
    .set({ planKey: plan.key, status: "active", startedAt: new Date(), expiresAt })
    .where(eq(sellerSubscriptions.sellerId, sellerId))
    .returning();
  return updated;
}

export async function isSubscriptionActive(sellerId: number) {
  const row = await ensureSellerSubscription(sellerId);
  if (row.planKey === "free") return true;
  if (!row.expiresAt) return true;
  return new Date(row.expiresAt).getTime() > Date.now();
}

/** Downgrades expired paid subscriptions back to Free automatically. */
export async function reconcileExpiredSubscription(sellerId: number) {
  const row = await ensureSellerSubscription(sellerId);
  if (row.planKey !== "free" && row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
    const [updated] = await db
      .update(sellerSubscriptions)
      .set({ planKey: "free", status: "expired" })
      .where(and(eq(sellerSubscriptions.sellerId, sellerId)))
      .returning();
    return updated;
  }
  return row;
}
