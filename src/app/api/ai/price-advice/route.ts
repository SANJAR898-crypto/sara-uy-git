import { NextRequest, NextResponse } from "next/server";
import { computePriceAdvice } from "@/lib/ai";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

/**
 * AI Price Advisor — suggests a fair price range for a listing by comparing
 * it against similar active properties (same category/city/deal type).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const category = params.get("category");
  const city = params.get("city");
  const dealType = params.get("dealType");
  const area = params.get("area") ? Number(params.get("area")) : null;
  const rooms = params.get("rooms") ? Number(params.get("rooms")) : null;

  if (!category || !dealType) {
    return NextResponse.json({ error: "category va dealType majburiy" }, { status: 400 });
  }

  let comparables = await queryProperties({
    status: "active",
    category,
    dealType,
    city: city ?? undefined,
    limit: 200,
  });

  // Widen the search if there isn't enough local data for a confident estimate.
  if (comparables.length < 3 && city) {
    comparables = await queryProperties({ status: "active", category, dealType, limit: 200 });
  }

  const advice = computePriceAdvice(comparables, { area, rooms });
  if (!advice) {
    return NextResponse.json({
      advice: null,
      message: "Taqqoslash uchun yetarli ma'lumot topilmadi. Narxni bozor tahliliga asoslanib belgilang.",
    });
  }

  return NextResponse.json({ advice });
}
