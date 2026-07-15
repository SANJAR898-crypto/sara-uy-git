import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, payments, reports, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();

    const [userStats] = await db
      .select({
        totalUsers: sql<number>`count(*)::int`,
        totalSellers: sql<number>`count(*) filter (where ${users.isSeller} = true)::int`,
        bannedUsers: sql<number>`count(*) filter (where ${users.isBanned} = true)::int`,
      })
      .from(users);

    const [listingStats] = await db
      .select({
        totalListings: sql<number>`count(*)::int`,
        pendingListings: sql<number>`count(*) filter (where ${listings.status} = 'pending')::int`,
        approvedListings: sql<number>`count(*) filter (where ${listings.status} = 'approved')::int`,
        rejectedListings: sql<number>`count(*) filter (where ${listings.status} = 'rejected')::int`,
        vipListings: sql<number>`count(*) filter (where ${listings.plan} = 'vip')::int`,
        totalViews: sql<number>`coalesce(sum(${listings.viewsCount}), 0)::int`,
      })
      .from(listings);

    const [reportStats] = await db
      .select({
        pendingReports: sql<number>`count(*) filter (where ${reports.status} = 'pending')::int`,
      })
      .from(reports);

    const [paymentStats] = await db
      .select({
        pendingPayments: sql<number>`count(*) filter (where ${payments.status} = 'pending')::int`,
        totalRevenue: sql<number>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'approved'), 0)::int`,
      })
      .from(payments);

    return NextResponse.json({
      users: userStats,
      listings: listingStats,
      reports: reportStats,
      payments: paymentStats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
