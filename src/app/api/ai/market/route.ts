import { NextRequest, NextResponse } from "next/server";
import { 
  generateMarketAnalytics,
  getAreaMarketSummary,
  predictPriceTrend 
} from "@/lib/ai/market";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

/**
 * AI Market Analytics
 * Price trends, district heatmaps, investment scores
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const city = searchParams.get("city");
    const district = searchParams.get("district");
    const type = searchParams.get("type") || "full"; // full | summary | prediction

    // Get all active properties
    const properties = await queryProperties({
      status: "active",
      city: city || undefined,
      limit: 500,
    });

    if (type === "summary" && city) {
      // Get area summary
      const summary = getAreaMarketSummary(properties, city, district || undefined);
      return NextResponse.json({ summary });
    }

    if (type === "prediction" && city) {
      // Get price prediction
      const prediction = predictPriceTrend(properties, city, 3);
      return NextResponse.json({ prediction });
    }

    // Full analytics
    const analytics = generateMarketAnalytics(properties);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("AI Market error:", error);
    return NextResponse.json(
      { error: "Bozor tahlilida xatolik" },
      { status: 500 }
    );
  }
}
