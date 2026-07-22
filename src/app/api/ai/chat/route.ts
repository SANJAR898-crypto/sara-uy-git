import { NextRequest, NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";
import { chatWithSaraAI, getChatHistory } from "@/lib/ai/chat";
import { isRateLimited } from "@/lib/ai/rate-limit";

export const dynamic = "force-dynamic";

/**
 * AI Smart Chat — "Sara AI" buyer assistant. Works for guests (client
 * generates a random sessionId) and signed-in users (turns are additionally
 * tied to their account). Rate-limited per session to prevent abuse.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body?.sessionId === "string" && body.sessionId.length >= 8 ? body.sessionId : null;

  if (!message) return NextResponse.json({ error: "message majburiy" }, { status: 400 });
  if (message.length > 800) return NextResponse.json({ error: "Xabar juda uzun (maksimal 800 belgi)" }, { status: 400 });
  if (!sessionId) return NextResponse.json({ error: "sessionId majburiy" }, { status: 400 });

  const user = await getCurrentDbUser();
  const identifier = user ? `u${user.id}` : sessionId;
  if (isRateLimited("ai.chat", identifier, 20, 60_000)) {
    return NextResponse.json({ error: "Juda ko'p so'rov. Birozdan so'ng qayta urining." }, { status: 429 });
  }

  const language = typeof body?.language === "string" ? body.language : user?.languageCode || "uz";
  const propertyId = body?.propertyId != null ? Number(body.propertyId) : null;

  const result = await chatWithSaraAI({
    sessionId,
    userId: user?.id ?? null,
    message,
    language,
    propertyId,
  });

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId majburiy" }, { status: 400 });

  const history = await getChatHistory(sessionId, 50);
  return NextResponse.json({
    messages: history.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
  });
}
