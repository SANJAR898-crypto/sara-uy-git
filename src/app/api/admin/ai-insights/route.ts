import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiLogs, properties, propertiesAi, users } from "@/db/schema";
import { desc, eq, gte, or, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * AI Analytics (Admin) — usage/latency/provider mix per AI endpoint plus a
 * live queue of AI-flagged listings (moderation + fraud) so admins can spot
 * abuse without manually re-reviewing every listing.
 */
export async function GET() {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [endpointStats, flaggedRows] = await Promise.all([
    db
      .select({
        endpoint: aiLogs.endpoint,
        calls: sql<number>`count(*)::int`,
        successRate: sql<number>`round(avg(case when ${aiLogs.success} then 100 else 0 end))::int`,
        avgLatencyMs: sql<number>`round(avg(${aiLogs.latencyMs}))::int`,
        aiCalls: sql<number>`count(*) filter (where ${aiLogs.provider} = 'openai')::int`,
      })
      .from(aiLogs)
      .where(gte(aiLogs.createdAt, since))
      .groupBy(aiLogs.endpoint)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        propertyId: propertiesAi.propertyId,
        title: properties.title,
        sellerId: properties.sellerId,
        sellerName: users.username,
        moderationStatus: propertiesAi.moderationStatus,
        moderationReasons: propertiesAi.moderationReasons,
        fraudScore: propertiesAi.fraudScore,
        fraudSignals: propertiesAi.fraudSignals,
        updatedAt: propertiesAi.updatedAt,
      })
      .from(propertiesAi)
      .innerJoin(properties, eq(propertiesAi.propertyId, properties.id))
      .innerJoin(users, eq(properties.sellerId, users.id))
      .where(
        or(
          sql`${propertiesAi.moderationStatus} in ('flagged', 'needs_review', 'reject', 'rejected')`,
          gte(propertiesAi.fraudScore, 50)
        )
      )
      .orderBy(desc(propertiesAi.updatedAt))
      .limit(30),
  ]);

  return NextResponse.json({
    since: since.toISOString(),
    endpointStats,
    flagged: flaggedRows.map((r) => ({ ...r, propertyId: String(r.propertyId), sellerId: String(r.sellerId) })),
  });
}
