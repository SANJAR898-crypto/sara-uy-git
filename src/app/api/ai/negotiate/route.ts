import { NextRequest, NextResponse } from "next/server";
import { getNegotiationAdvice } from "@/lib/ai/chat";
import { isRateLimited } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";

/**
 * AI Negotiation Assistant — suggests an opening offer, estimates the fair
 * price, a negotiation margin, and a closing probability for a given
 * listing (and optional buyer offer).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const propertyId = Number(body?.propertyId);
  if (!Number.isFinite(propertyId)) return NextResponse.json({ error: "propertyId majburiy" }, { status: 400 });

  const identifier = req.headers.get("x-forwarded-for") || "anon";
  if (isRateLimited("ai.negotiate", identifier, 30, 60_000)) {
    return NextResponse.json({ error: "Juda ko'p so'rov. Birozdan so'ng qayta urining." }, { status: 429 });
  }

  const offerPrice = body?.offerPrice != null ? Number(body.offerPrice) : null;
  const advice = await getNegotiationAdvice(propertyId, offerPrice);
  if (!advice) return NextResponse.json({ error: "E'lon topilmadi" }, { status: 404 });

  return NextResponse.json({ advice });
}
