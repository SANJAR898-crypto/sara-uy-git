/**
 * AI Market Intelligence + AI Investment Score (Phase 9)
 *
 * Aggregates live listing data into supply/demand, price-trend and
 * district-ranking signals, and derives a 0-100 "Investment Score" for a
 * single property relative to that market snapshot. Expensive aggregate
 * queries are memoised with the shared AI cache so repeated requests (e.g.
 * the buyer chat, the price advisor and the market dashboard all asking
 * about "Chilonzor") don't hammer the database.
 */
import { db } from "@/db";
import { properties, propertiesAi } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { withCache } from "@/lib/ai/cache";

export interface DistrictStat {
  district: string;
  city: string;
  avgPrice: number;
  listingsCount: number;
  avgViews: number;
  demandScore: number; // 0-100, relative to the strongest district in this snapshot
}

export interface MarketIntelligence {
  generatedAt: string;
  totalActive: number;
  avgPriceByCategory: { category: string; avgPrice: number; count: number }[];
  districtRanking: DistrictStat[];
  supplyDemand: { supply: number; demandProxy: number; healthScore: number };
  priceTrend: { last30Avg: number | null; prior30Avg: number | null; changePct: number | null };
  rentalYieldProxy: number | null; // estimated annual gross yield %, when both rent & sale data exist
}

async function computeMarketIntelligenceUncached(city?: string | null): Promise<MarketIntelligence> {
  const cityFilter = city ? sql`and ${properties.city} = ${city}` : sql``;

  const [totalRows, categoryRows, districtRows, trendRows, saleAvgRows, rentAvgRows] = await Promise.all([
    db.execute<{ total: number }>(sql`select count(*)::int as total from ${properties} where ${properties.status} = 'active' ${cityFilter}`),
    db.execute<{ category: string; avg_price: number; count: number }>(
      sql`select category, avg(price)::float as avg_price, count(*)::int as count from ${properties} where status = 'active' ${cityFilter} group by category`
    ),
    db.execute<{ district: string; city: string; avg_price: number; count: number; avg_views: number }>(
      sql`select district, city, avg(price)::float as avg_price, count(*)::int as count, avg(views)::float as avg_views
          from ${properties} where status = 'active' ${cityFilter}
          group by district, city order by count(*) desc limit 12`
    ),
    db.execute<{ bucket: string; avg_price: number }>(
      sql`select case when created_at > now() - interval '30 days' then 'recent' else 'prior' end as bucket, avg(price)::float as avg_price
          from ${properties}
          where status = 'active' and created_at > now() - interval '60 days' ${cityFilter}
          group by bucket`
    ),
    db.execute<{ avg_price: number }>(
      sql`select avg(price)::float as avg_price from ${properties} where status = 'active' and deal_type = 'sale' ${cityFilter}`
    ),
    db.execute<{ avg_price: number }>(
      sql`select avg(price)::float as avg_price from ${properties} where status = 'active' and deal_type = 'rent' ${cityFilter}`
    ),
  ]);

  const total = ((totalRows.rows as unknown as { total: number }[])[0]?.total) ?? 0;
  const categoryStats = (categoryRows.rows as unknown as { category: string; avg_price: number; count: number }[]) ?? [];
  const districtStatsRaw = (districtRows.rows as unknown as { district: string; city: string; avg_price: number; count: number; avg_views: number }[]) ?? [];
  const trendStats = (trendRows.rows as unknown as { bucket: string; avg_price: number }[]) ?? [];
  const saleAvg = ((saleAvgRows.rows as unknown as { avg_price: number | null }[])[0]?.avg_price) ?? null;
  const rentAvg = ((rentAvgRows.rows as unknown as { avg_price: number | null }[])[0]?.avg_price) ?? null;

  const maxDemandRaw = Math.max(1, ...districtStatsRaw.map((d) => d.count * 1.5 + (d.avg_views || 0)));
  const districtRanking: DistrictStat[] = districtStatsRaw.map((d) => ({
    district: d.district,
    city: d.city,
    avgPrice: Math.round(d.avg_price || 0),
    listingsCount: d.count,
    avgViews: Math.round(d.avg_views || 0),
    demandScore: Math.round(Math.min(100, ((d.count * 1.5 + (d.avg_views || 0)) / maxDemandRaw) * 100)),
  }));

  const last30Avg = trendStats.find((t) => t.bucket === "recent")?.avg_price ?? null;
  const prior30Avg = trendStats.find((t) => t.bucket === "prior")?.avg_price ?? null;
  const changePct = last30Avg != null && prior30Avg != null && prior30Avg > 0 ? Math.round(((last30Avg - prior30Avg) / prior30Avg) * 1000) / 10 : null;

  const rentalYieldProxy = saleAvg && rentAvg && saleAvg > 0 ? Math.round(((rentAvg * 12) / saleAvg) * 1000) / 10 : null;

  const supply = total;
  const demandProxy = Math.round(districtRanking.reduce((sum, d) => sum + d.avgViews, 0));
  const healthScore = Math.max(5, Math.min(100, Math.round(50 + (changePct ?? 0) * 2 + Math.min(20, supply / 5))));

  return {
    generatedAt: new Date().toISOString(),
    totalActive: total,
    avgPriceByCategory: categoryStats.map((c) => ({ category: c.category, avgPrice: Math.round(c.avg_price || 0), count: c.count })),
    districtRanking,
    supplyDemand: { supply, demandProxy, healthScore },
    priceTrend: { last30Avg: last30Avg != null ? Math.round(last30Avg) : null, prior30Avg: prior30Avg != null ? Math.round(prior30Avg) : null, changePct },
    rentalYieldProxy,
  };
}

export async function computeMarketIntelligence(filters: { city?: string | null } = {}): Promise<MarketIntelligence> {
  const key = `market:${filters.city ?? "all"}`;
  return withCache(key, 10 * 60 * 1000, () => computeMarketIntelligenceUncached(filters.city));
}

export interface InvestmentBreakdown {
  priceVsMarket: number; // 0-100, higher = more attractively priced vs district average
  districtDemand: number; // 0-100
  marketMomentum: number; // 0-100, derived from price trend direction
  rentalPotential: number; // 0-100
}

export interface InvestmentResult {
  score: number; // 0-100
  breakdown: InvestmentBreakdown;
  explanation: string;
}

export function computeInvestmentScore(
  property: { price: number; district: string; city: string; dealType: string },
  market: MarketIntelligence
): InvestmentResult {
  const districtStat = market.districtRanking.find((d) => d.district === property.district && d.city === property.city);

  let priceVsMarket = 55;
  if (districtStat && districtStat.avgPrice > 0) {
    const diff = (districtStat.avgPrice - property.price) / districtStat.avgPrice; // positive = cheaper than area avg
    priceVsMarket = Math.round(Math.max(0, Math.min(100, 55 + diff * 150)));
  }

  const districtDemand = districtStat?.demandScore ?? 50;

  const trendPct = market.priceTrend.changePct ?? 0;
  const marketMomentum = Math.round(Math.max(0, Math.min(100, 50 + trendPct * 4)));

  const rentalPotential = market.rentalYieldProxy != null ? Math.round(Math.max(0, Math.min(100, market.rentalYieldProxy * 8))) : 50;

  const score = Math.round(priceVsMarket * 0.35 + districtDemand * 0.3 + marketMomentum * 0.2 + rentalPotential * 0.15);

  const strongest = Object.entries({ priceVsMarket, districtDemand, marketMomentum, rentalPotential }).sort((a, b) => b[1] - a[1])[0];
  const labels: Record<string, string> = {
    priceVsMarket: "hudud o'rtacha narxidan arzonligi",
    districtDemand: "hududdagi yuqori talab",
    marketMomentum: "bozor narxlari o'sish dinamikasi",
    rentalPotential: "ijaradan daromadlilik salohiyati",
  };

  return {
    score: Math.max(5, Math.min(100, score)),
    breakdown: { priceVsMarket, districtDemand, marketMomentum, rentalPotential },
    explanation: `Investitsiya balli ${score}/100 — asosiy sabab: ${labels[strongest[0]] ?? "umumiy bozor holati"}.`,
  };
}

/** Computes and persists the investment snapshot for a property on `properties_ai`. */
export async function refreshInvestmentSnapshot(propertyId: number, property: { price: number; district: string; city: string; dealType: string }) {
  const market = await computeMarketIntelligence({ city: property.city });
  const result = computeInvestmentScore(property, market);

  const breakdown = result.breakdown as unknown as Record<string, unknown>;
  await db
    .insert(propertiesAi)
    .values({ propertyId, investmentScore: result.score, investmentBreakdown: breakdown, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: propertiesAi.propertyId,
      set: { investmentScore: result.score, investmentBreakdown: breakdown, updatedAt: new Date() },
    });

  return result;
}

export async function getPropertyInvestmentSnapshot(propertyId: number) {
  const rows = await db.select().from(propertiesAi).where(eq(propertiesAi.propertyId, propertyId)).limit(1);
  return rows[0] ?? null;
}
