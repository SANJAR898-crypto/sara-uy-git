import { NextRequest, NextResponse } from "next/server";
import { 
  processUserMessage,
  getHelpText,
  formatPropertyForChat,
} from "@/lib/ai/chat";
import type { ChatMessage } from "@/lib/ai/types";
import { parseNaturalLanguageQuery, filtersToQueryParams } from "@/lib/ai/search";
import { queryProperties } from "@/lib/properties-query";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * AI Chat Assistant
 * Conversational AI for property search and advice in Uzbek
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message majburiy" },
        { status: 400 }
      );
    }

    // Get session for personalization
    const session = await getSession();

    // Process message
    const result = processUserMessage(message, history, {
      userName: session ? `User ${session.uid}` : undefined,
    });

    // If it's a search intent, fetch properties
    let properties: Array<{
      title: string;
      price: number;
      currency: string;
      rooms: number;
      area: number;
      district: string;
      city: string;
      id: string;
    }> = [];

    if (result.intent.type === "search" && result.searchQuery) {
      const parsed = parseNaturalLanguageQuery(message);
      const params = filtersToQueryParams(parsed.filters);
      
      const fetchedProperties = await queryProperties({
        status: "active",
        category: params.category,
        dealType: params.dealType,
        city: params.city,
        district: params.district,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        limit: 5,
      });

      properties = fetchedProperties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: p.currency,
        rooms: p.rooms,
        area: p.area,
        district: p.district,
        city: p.city,
      }));
    }

    // Generate response message
    const responseMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: result.response,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: result.intent.type,
        properties: properties.map(p => p.id),
        suggestions: result.suggestions,
      },
    };

    return NextResponse.json({
      message: responseMessage,
      properties: properties.map(p => ({
        ...p,
        formatted: formatPropertyForChat(p),
      })),
      intent: result.intent,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Chat xatoligi" },
      { status: 500 }
    );
  }
}

/**
 * Get help text for the chat assistant
 */
export async function GET() {
  return NextResponse.json({
    help: getHelpText(),
    suggestions: [
      "Toshkentda 2 xonali kvartira",
      "Arzon uylar Chilonzorda",
      "Ipoteka foizlari qanday?",
      "Qaysi tuman yaxshi?",
    ],
  });
}
