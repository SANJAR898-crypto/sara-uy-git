import { NextResponse } from "next/server";
import { parseNaturalLanguageQuery } from "@/lib/ai-search";
import { handleApiError, jsonError } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const query: string | undefined = body?.query;
    if (!query || query.trim().length < 2) return jsonError("Qidiruv so'rovi talab qilinadi", 400);

    const filters = parseNaturalLanguageQuery(query);
    return NextResponse.json({ filters });
  } catch (error) {
    return handleApiError(error);
  }
}
