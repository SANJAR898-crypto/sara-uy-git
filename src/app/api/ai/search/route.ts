import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageQuery, describeQuery, filtersToQueryParams } from "@/lib/ai/search";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

/**
 * AI Natural Language Search
 * Converts Uzbek queries like "Namanganda 3 xonali hovli 700 mln gacha" to structured filters
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, limit = 20 } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "query majburiy" },
        { status: 400 }
      );
    }

    // Parse natural language query
    const parsed = parseNaturalLanguageQuery(query);
    
    // Convert to query params
    const params = filtersToQueryParams(parsed.filters);
    
    // Query properties with parsed filters
    const properties = await queryProperties({
      status: "active",
      category: params.category,
      dealType: params.dealType,
      city: params.city,
      district: params.district,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      minRooms: params.minRooms ? Number(params.minRooms) : undefined,
      maxRooms: params.maxRooms ? Number(params.maxRooms) : undefined,
      query: parsed.filters.keywords?.join(" "),
      limit,
    });

    return NextResponse.json({
      query: {
        original: query,
        parsed: parsed.filters,
        description: describeQuery(parsed),
        confidence: parsed.confidence,
        suggestions: parsed.suggestions,
      },
      properties,
      total: properties.length,
    });
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json(
      { error: "Qidiruvda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
