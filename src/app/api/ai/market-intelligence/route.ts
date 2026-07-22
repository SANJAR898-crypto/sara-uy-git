import { NextRequest, NextResponse } from "next/server";
import { computeMarketIntelligence } from "@/lib/ai/market";

export const dynamic = "force-dynamic";

/**
 * AI Market Intelligence — supply/demand, price trend, district ranking and
 * rental-yield proxy computed from live listing data. Cached for 10 minutes
 * per city to keep the dashboard and chat assistant fast.
 */
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  const market = await computeMarketIntelligence({ city: city || undefined });
  return NextResponse.json({ market });
}
