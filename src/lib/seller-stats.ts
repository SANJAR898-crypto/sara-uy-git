import { db } from "@/db";
import { favorites, properties, propertyEvents } from "@/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getPlanByKey, getSellerSubscriptionRow, reconcileExpiredSubscription } from "@/lib/subscription";
import type { SellerDashboardStats, SellerSubscriptionInfo } from "@/types";

export async function getSellerSubscriptionInfo(sellerId: number): Promise<SellerSubscriptionInfo> {
  await reconcileExpiredSubscription(sellerId);
  const sub = await getSellerSubscriptionRow(sellerId);
  const plan = await getPlanByKey(sub.planKey);

  const activeStatuses = ["draft", "pending", "active", "paused"] as const;
  const [usage] = await db
    .select({
      listings: sql<number>`count(*)::int`,
      vipListings: sql<number>`count(*) filter (where ${properties.isVip} = true)::int`,
      premiumListings: sql<number>`count(*) filter (where ${properties.isPremium} = true)::int`,
    })
    .from(properties)
    .where(and(eq(properties.sellerId, sellerId), sql`${properties.status} = any(${activeStatuses})`));

  return {
    plan,
    status: sub.status as SellerSubscriptionInfo["status"],
    startedAt: new Date(sub.startedAt).toISOString(),
    expiresAt: sub.expiresAt ? new Date(sub.expiresAt).toISOString() : null,
    usage: {
      listings: usage?.listings ?? 0,
      vipListings: usage?.vipListings ?? 0,
      premiumListings: usage?.premiumListings ?? 0,
    },
  };
}

export async function getSellerDashboardStats(sellerId: number): Promise<SellerDashboardStats> {
  const [totalsRow] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'active')::int`,
      draft: sql<number>`count(*) filter (where status = 'draft')::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      paused: sql<number>`count(*) filter (where status = 'paused')::int`,
      rejected: sql<number>`count(*) filter (where status = 'rejected')::int`,
      archived: sql<number>`count(*) filter (where status = 'archived')::int`,
      expired: sql<number>`count(*) filter (where status = 'expired')::int`,
      sold: sql<number>`count(*) filter (where status = 'sold')::int`,
      vip: sql<number>`count(*) filter (where is_vip = true)::int`,
      premium: sql<number>`count(*) filter (where is_premium = true)::int`,
    })
    .from(properties)
    .where(eq(properties.sellerId, sellerId));

  const [engagementRow] = await db
    .select({
      views: sql<number>`coalesce(sum(views), 0)::int`,
      favorites: sql<number>`coalesce(sum(favorites_count), 0)::int`,
      telegramContacts: sql<number>`coalesce(sum(telegram_contacts), 0)::int`,
      phoneCalls: sql<number>`coalesce(sum(phone_calls), 0)::int`,
      messages: sql<number>`coalesce(sum(messages_count), 0)::int`,
    })
    .from(properties)
    .where(eq(properties.sellerId, sellerId));

  // Weekly (last 7 days) view events time-series.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyRows = await db
    .select({
      date: sql<string>`to_char(${propertyEvents.createdAt}, 'YYYY-MM-DD')`,
      views: sql<number>`count(*) filter (where ${propertyEvents.type} = 'view')::int`,
    })
    .from(propertyEvents)
    .innerJoin(properties, eq(propertyEvents.propertyId, properties.id))
    .where(and(eq(properties.sellerId, sellerId), gte(propertyEvents.createdAt, sevenDaysAgo)))
    .groupBy(sql`to_char(${propertyEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${propertyEvents.createdAt}, 'YYYY-MM-DD')`);

  const weeklyMap = new Map(weeklyRows.map((r) => [r.date, r.views]));
  const weekly = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, views: weeklyMap.get(key) ?? 0 };
  });

  // Monthly (last 6 months) view events time-series.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRows = await db
    .select({
      month: sql<string>`to_char(${propertyEvents.createdAt}, 'YYYY-MM')`,
      views: sql<number>`count(*) filter (where ${propertyEvents.type} = 'view')::int`,
    })
    .from(propertyEvents)
    .innerJoin(properties, eq(propertyEvents.propertyId, properties.id))
    .where(and(eq(properties.sellerId, sellerId), gte(propertyEvents.createdAt, sixMonthsAgo)))
    .groupBy(sql`to_char(${propertyEvents.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${propertyEvents.createdAt}, 'YYYY-MM')`);

  const monthlyMap = new Map(monthlyRows.map((r) => [r.month, r.views]));
  const monthly = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    return { month: key, views: monthlyMap.get(key) ?? 0 };
  });

  const topListings = await db
    .select({
      id: properties.id,
      title: properties.title,
      views: properties.views,
      favoritesCount: properties.favoritesCount,
    })
    .from(properties)
    .where(eq(properties.sellerId, sellerId))
    .orderBy(desc(properties.views))
    .limit(5);

  const subscription = await getSellerSubscriptionInfo(sellerId);

  return {
    totals: {
      total: totalsRow?.total ?? 0,
      active: totalsRow?.active ?? 0,
      draft: totalsRow?.draft ?? 0,
      pending: totalsRow?.pending ?? 0,
      paused: totalsRow?.paused ?? 0,
      rejected: totalsRow?.rejected ?? 0,
      archived: totalsRow?.archived ?? 0,
      expired: totalsRow?.expired ?? 0,
      sold: totalsRow?.sold ?? 0,
      vip: totalsRow?.vip ?? 0,
      premium: totalsRow?.premium ?? 0,
    },
    engagement: {
      views: engagementRow?.views ?? 0,
      favorites: engagementRow?.favorites ?? 0,
      telegramContacts: engagementRow?.telegramContacts ?? 0,
      phoneCalls: engagementRow?.phoneCalls ?? 0,
      messages: engagementRow?.messages ?? 0,
    },
    weekly,
    monthly,
    topListings: topListings.map((t) => ({ id: String(t.id), title: t.title, views: t.views, favoritesCount: t.favoritesCount })),
    subscription,
  };
}

export async function getListingAnalytics(propertyId: number) {
  const [prop] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!prop) return null;

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const dailyRows = await db
    .select({
      date: sql<string>`to_char(${propertyEvents.createdAt}, 'YYYY-MM-DD')`,
      views: sql<number>`count(*) filter (where ${propertyEvents.type} = 'view')::int`,
    })
    .from(propertyEvents)
    .where(and(eq(propertyEvents.propertyId, propertyId), gte(propertyEvents.createdAt, fourteenDaysAgo)))
    .groupBy(sql`to_char(${propertyEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${propertyEvents.createdAt}, 'YYYY-MM-DD')`);

  const dailyMap = new Map(dailyRows.map((r) => [r.date, r.views]));
  const daily = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, views: dailyMap.get(key) ?? 0 };
  });

  const totalContacts = prop.telegramContacts + prop.phoneCalls + prop.messagesCount;
  const conversionRate = prop.views > 0 ? Math.round((totalContacts / prop.views) * 1000) / 10 : 0;

  return {
    propertyId: String(prop.id),
    daily,
    totals: {
      views: prop.views,
      favorites: prop.favoritesCount,
      telegramContacts: prop.telegramContacts,
      phoneCalls: prop.phoneCalls,
      messages: prop.messagesCount,
      conversionRate,
    },
  };
}

export async function logPropertyEvent(propertyId: number, type: string) {
  await db.insert(propertyEvents).values({ propertyId, type });
}
