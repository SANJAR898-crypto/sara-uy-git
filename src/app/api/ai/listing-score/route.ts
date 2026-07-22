import { NextRequest, NextResponse } from "next/server";
import { computePriceAdvice } from "@/lib/ai";
import { computeListingQualityScore } from "@/lib/ai/listing-score";
import { queryProperties } from "@/lib/properties-query";

export const dynamic = "force-dynamic";

/**
 * AI Listing Score — used by the seller listing wizard to grade a
 * draft/listing before publishing (title, description, photos, price
 * positioning, completeness) with concrete improvement suggestions.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.title) return NextResponse.json({ error: "title majburiy" }, { status: 400 });

  let priceAdvice = null;
  if (body.category && body.dealType && body.city && body.price) {
    const comparables = await queryProperties({
      status: "active",
      category: String(body.category),
      dealType: String(body.dealType),
      city: String(body.city),
      limit: 200,
    });
    priceAdvice = computePriceAdvice(comparables, {
      area: body.area != null ? Number(body.area) : null,
      rooms: body.rooms != null ? Number(body.rooms) : null,
    });
  }

  const result = computeListingQualityScore(
    {
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      price: Number(body.price ?? 0),
      rooms: body.rooms != null ? Number(body.rooms) : null,
      area: body.area != null ? Number(body.area) : null,
      floor: body.floor != null ? Number(body.floor) : null,
      yearBuilt: body.yearBuilt != null ? Number(body.yearBuilt) : null,
      amenities: body.amenities && typeof body.amenities === "object" ? body.amenities : {},
      contactPhone: body.contactPhone ?? null,
    },
    priceAdvice
  );

  return NextResponse.json({ score: result });
}
