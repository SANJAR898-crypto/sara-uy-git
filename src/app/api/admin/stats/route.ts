import { NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, notifications, properties, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const [[userStats], [propStats], [favStats], [notifStats], byCategory, byStatus, byCity] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        sellers: sql<number>`count(*) filter (where role = 'seller')::int`,
        admins: sql<number>`count(*) filter (where role = 'admin')::int`,
        verified: sql<number>`count(*) filter (where is_verified = true)::int`,
      })
      .from(users),
    db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where status = 'active')::int`,
        pending: sql<number>`count(*) filter (where status = 'pending')::int`,
        rejected: sql<number>`count(*) filter (where status = 'rejected')::int`,
        archived: sql<number>`count(*) filter (where status = 'archived')::int`,
        vip: sql<number>`count(*) filter (where is_vip = true)::int`,
        views: sql<number>`coalesce(sum(views), 0)::int`,
      })
      .from(properties),
    db.select({ total: sql<number>`count(*)::int` }).from(favorites),
    db.select({ total: sql<number>`count(*)::int` }).from(notifications),
    db
      .select({ category: properties.category, count: sql<number>`count(*)::int` })
      .from(properties)
      .groupBy(properties.category),
    db
      .select({ status: properties.status, count: sql<number>`count(*)::int` })
      .from(properties)
      .groupBy(properties.status),
    db
      .select({ city: properties.city, count: sql<number>`count(*)::int` })
      .from(properties)
      .groupBy(properties.city)
      .orderBy(sql`count(*) desc`)
      .limit(6),
  ]);

  return NextResponse.json({
    users: userStats,
    properties: propStats,
    favorites: favStats,
    notifications: notifStats,
    byCategory,
    byStatus,
    byCity,
  });
}
