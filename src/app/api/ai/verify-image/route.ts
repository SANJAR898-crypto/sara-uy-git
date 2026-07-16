import { NextRequest, NextResponse } from "next/server";
import { verifyImagesHeuristic } from "@/lib/ai";
import { getCurrentDbUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * AI Image Verification — heuristic quality/authenticity check for listing
 * photos (protocol, trusted CDN host, extension, duplicates). Used by both
 * sellers (pre-submit hint) and admins (moderation aid).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const images: string[] = Array.isArray(body.images) ? body.images.filter((i: unknown) => typeof i === "string") : [];

  const result = verifyImagesHeuristic(images);
  return NextResponse.json(result);
}
