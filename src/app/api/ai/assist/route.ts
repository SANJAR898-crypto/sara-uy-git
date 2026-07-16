import { NextRequest, NextResponse } from "next/server";
import { generateListingAssist } from "@/lib/ai-assist";

export const dynamic = "force-dynamic";

/**
 * AI Assist — generates a suggested title, description and tags for a
 * listing based on its structured attributes. Runs on offline heuristics
 * today; architecture is provider-agnostic (see `@/lib/ai-assist`) so a real
 * LLM can be swapped in later without touching this route.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.category || !body.dealType || !body.city) {
    return NextResponse.json({ error: "category, dealType va city majburiy" }, { status: 400 });
  }

  const result = await generateListingAssist({
    category: String(body.category),
    dealType: String(body.dealType),
    city: String(body.city),
    district: body.district ? String(body.district) : undefined,
    rooms: body.rooms != null ? Number(body.rooms) : undefined,
    area: body.area != null ? Number(body.area) : undefined,
    amenities: Array.isArray(body.amenities) ? body.amenities.map(String) : undefined,
  });

  return NextResponse.json(result);
}
