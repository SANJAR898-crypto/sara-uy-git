import { NextRequest, NextResponse } from "next/server";
import { calculateListingQuality, getQualityImprovements } from "@/lib/ai/quality";

export const dynamic = "force-dynamic";

/**
 * AI Listing Quality Score
 * Analyzes listing data and returns quality score with suggestions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing } = body;

    if (!listing) {
      return NextResponse.json(
        { error: "listing majburiy" },
        { status: 400 }
      );
    }

    // Calculate quality score
    const quality = calculateListingQuality(listing);
    
    // Get improvement suggestions
    const improvements = getQualityImprovements(quality);

    return NextResponse.json({
      quality,
      improvements,
    });
  } catch (error) {
    console.error("AI Quality error:", error);
    return NextResponse.json(
      { error: "Sifat tahlilida xatolik" },
      { status: 500 }
    );
  }
}
