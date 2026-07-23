import { NextRequest, NextResponse } from "next/server";
import { generateListingAssist } from "@/lib/ai-assist";
import { isRateLimited } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/**
 * AI Assist — generates a suggested title, description and tags for a
 * listing based on its structured attributes. Runs on offline heuristics
 * today; architecture is provider-agnostic (see `@/lib/ai-assist`) so a real
 * LLM can be swapped in later without touching this route.
 */
export async function POST(req: NextRequest) {
  // Unauthenticated endpoint (used from the listing wizard before submit) —
  // guard against abuse with a per-IP sliding window.
  if (isRateLimited("ai.assist", clientIp(req), 30, 60_000)) {
    return NextResponse.json({ error: "Juda ko'p urinish. Birozdan so'ng qayta urining." }, { status: 429 });
  }

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
