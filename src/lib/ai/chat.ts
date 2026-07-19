/**
 * Sara Uylar — AI Chat Assistant Service (Phase 6)
 * Conversational AI for property search and advice in Uzbek
 */

import type { ChatMessage, ChatIntent } from "./types";
import { parseNaturalLanguageQuery, describeQuery } from "./search";

// Intent patterns for Uzbek language
const INTENT_PATTERNS: Array<{
  patterns: RegExp[];
  type: ChatIntent["type"];
}> = [
  {
    type: "search",
    patterns: [
      /qidir/i,
      /topish/i,
      /izla/i,
      /kerak/i,
      /bor\s*mi/i,
      /ko'rsat/i,
      /xonali/i,
      /sotiladi/i,
      /ijaraga/i,
    ],
  },
  {
    type: "price_query",
    patterns: [
      /narx/i,
      /qancha/i,
      /necha/i,
      /byudjet/i,
      /arzon/i,
      /qimmat/i,
      /o'rtacha/i,
      /bozor/i,
    ],
  },
  {
    type: "region_info",
    patterns: [
      /hudud/i,
      /tuman/i,
      /shahar/i,
      /joy/i,
      /qayerda/i,
      /qayer/i,
      /yaxshi\s*joy/i,
      /infratuzilma/i,
    ],
  },
  {
    type: "compare",
    patterns: [
      /taqqosla/i,
      /farqi/i,
      /yaxshisi/i,
      /qaysi\s*yaxshi/i,
      /solishtirsak/i,
    ],
  },
  {
    type: "mortgage",
    patterns: [
      /ipoteka/i,
      /kredit/i,
      /bank/i,
      /to'lov/i,
      /oylik/i,
      /foiz/i,
      /muddatli/i,
    ],
  },
  {
    type: "investment",
    patterns: [
      /investitsiya/i,
      /daromad/i,
      /foyda/i,
      /qaytim/i,
      /roi/i,
      /sotib\s*ol/i,
      /qo'yish/i,
    ],
  },
];

// Response templates in Uzbek
const RESPONSE_TEMPLATES: Record<ChatIntent["type"], string[]> = {
  search: [
    "Sizning so'rovingiz bo'yicha qidiraman: {query}",
    "Yaxshi, {query} izlayapman...",
    "Sizga mos e'lonlarni topaman: {query}",
  ],
  price_query: [
    "{area} hududida o'rtacha narx {price} atrofida.",
    "Bozor tahlili bo'yicha {area}da narxlar {min} dan {max} gacha.",
    "Hozirgi vaqtda {area}da kvartiralarga talab {demand} darajada.",
  ],
  region_info: [
    "{district} — {city}ning {description} hududlaridan biri.",
    "{district} infratuzilmasi: {amenities}.",
    "{district}da yashash uchun {rating} baho beriladi.",
  ],
  compare: [
    "Ikkala variantni taqqoslayman:",
    "Asosiy farqlar quyidagicha:",
    "Sizning byudjetingiz uchun yaxshisi:",
  ],
  mortgage: [
    "Ipoteka kalkulyatori: {amount} so'm uchun oylik to'lov ~{monthly} so'm.",
    "Hozirda banklar {rate}% yillik stavka taklif qilmoqda.",
    "Ipoteka olish uchun kerakli hujjatlar ro'yxati:",
  ],
  investment: [
    "{area} investitsiya uchun {rating} darajada.",
    "Taxminiy ROI: {roi}% yillik.",
    "Bu hudud {trend} tendensiyaga ega.",
  ],
  general: [
    "Sizga qanday yordam bera olaman?",
    "Ko'chmas mulk bo'yicha savollaringiz bo'lsa, so'rang.",
    "Uy qidirish, narx tahlili yoki investitsiya maslahatida yordam beraman.",
  ],
};

// Uzbek greeting patterns
const GREETING_PATTERNS = [
  /salom/i,
  /assalomu\s*alaykum/i,
  /xayrli/i,
  /hey/i,
  /hi\b/i,
  /hello/i,
];

// Uzbek thank you patterns
const THANK_PATTERNS = [
  /rahmat/i,
  /tashakkur/i,
  /thank/i,
  /rahmat/i,
  /minnatdor/i,
];

/**
 * Detect the intent of a user message
 */
export function detectIntent(message: string): ChatIntent {
  const normalized = message.toLowerCase().trim();
  
  // Check for greetings (special case)
  if (GREETING_PATTERNS.some(p => p.test(normalized))) {
    return {
      type: "general",
      confidence: 90,
      entities: { greeting: "true" },
    };
  }
  
  // Check for thank you (special case)
  if (THANK_PATTERNS.some(p => p.test(normalized))) {
    return {
      type: "general",
      confidence: 90,
      entities: { thankYou: "true" },
    };
  }
  
  // Check each intent type
  for (const { patterns, type } of INTENT_PATTERNS) {
    const matchCount = patterns.filter(p => p.test(normalized)).length;
    if (matchCount > 0) {
      const confidence = Math.min(95, 50 + matchCount * 15);
      
      // Extract entities based on intent type
      const entities: Record<string, string | number> = {};
      
      // Try to parse as a search query
      const parsed = parseNaturalLanguageQuery(message);
      if (parsed.filters.city) entities.city = parsed.filters.city;
      if (parsed.filters.district) entities.district = parsed.filters.district;
      if (parsed.filters.category) entities.category = parsed.filters.category;
      if (parsed.filters.maxPrice) entities.maxPrice = parsed.filters.maxPrice;
      if (parsed.filters.minRooms) entities.rooms = parsed.filters.minRooms;
      
      return { type, confidence, entities };
    }
  }
  
  // Default to general if no specific intent detected
  return {
    type: "general",
    confidence: 30,
    entities: {},
  };
}

/**
 * Generate a response for the detected intent
 */
export function generateResponse(
  intent: ChatIntent,
  context: {
    userName?: string;
    lastSearchQuery?: string;
    propertyCount?: number;
    avgPrice?: number;
    city?: string;
    district?: string;
  } = {}
): string {
  const { type, entities } = intent;
  
  // Handle greetings
  if (entities.greeting === "true") {
    const greetings = [
      `Assalomu alaykum${context.userName ? `, ${context.userName}` : ""}! Sizga qanday yordam bera olaman?`,
      "Salom! Ko'chmas mulk bo'yicha savollaringiz bormi?",
      "Xush kelibsiz! Uy qidirishda yordam beraman.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Handle thank you
  if (entities.thankYou === "true") {
    const thanks = [
      "Arzimaydi! Yana savollaringiz bo'lsa, murojaat qiling.",
      "Marhamat! Sizga yordam berganimdan xursandman.",
      "Xizmatdaman! Yaxshi kun tilayman.",
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }
  
  // Get template for intent type
  const templates = RESPONSE_TEMPLATES[type];
  let response = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders
  response = response
    .replace("{query}", context.lastSearchQuery || "belgilangan mezonlar")
    .replace("{area}", context.district || context.city || "tanlangan hudud")
    .replace("{price}", context.avgPrice ? `$${context.avgPrice.toLocaleString()}` : "aniqlanmoqda")
    .replace("{min}", context.avgPrice ? `$${Math.round(context.avgPrice * 0.8).toLocaleString()}` : "")
    .replace("{max}", context.avgPrice ? `$${Math.round(context.avgPrice * 1.2).toLocaleString()}` : "")
    .replace("{demand}", "o'rtacha")
    .replace("{district}", entities.district as string || context.district || "Tanlangan tuman")
    .replace("{city}", entities.city as string || context.city || "Shahar")
    .replace("{description}", "rivojlangan")
    .replace("{amenities}", "metro, maktab, shifoxona yaqin")
    .replace("{rating}", "yaxshi")
    .replace("{amount}", "500,000,000")
    .replace("{monthly}", "5,000,000")
    .replace("{rate}", "24")
    .replace("{roi}", "15-20")
    .replace("{trend}", "o'sish");
  
  return response;
}

/**
 * Generate search suggestions based on conversation
 */
export function generateSearchSuggestions(
  messages: ChatMessage[],
  recentSearches: string[] = []
): string[] {
  const suggestions: string[] = [];
  
  // Extract topics from recent messages
  const userMessages = messages.filter(m => m.role === "user").slice(-5);
  const topics = new Set<string>();
  
  for (const msg of userMessages) {
    const parsed = parseNaturalLanguageQuery(msg.content);
    if (parsed.filters.city) topics.add(parsed.filters.city);
    if (parsed.filters.category) topics.add(parsed.filters.category);
  }
  
  // Generate suggestions based on topics
  if (topics.has("Toshkent")) {
    suggestions.push("Toshkentda 2 xonali kvartira");
    suggestions.push("Yunusobodda yangi uy");
  }
  
  if (topics.has("apartment")) {
    suggestions.push("3 xonali kvartira 100 mln gacha");
  }
  
  // Add some general suggestions
  suggestions.push("Eng arzon variantlar");
  suggestions.push("VIP e'lonlarni ko'rsat");
  suggestions.push("Bugun joylangan e'lonlar");
  
  // Include recent searches
  for (const search of recentSearches.slice(0, 2)) {
    if (!suggestions.includes(search)) {
      suggestions.push(`"${search}" yana qidirish`);
    }
  }
  
  return suggestions.slice(0, 5);
}

/**
 * Process user message and generate assistant response
 */
export function processUserMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
  context: {
    userName?: string;
    propertyCount?: number;
    avgPrice?: number;
  } = {}
): {
  response: string;
  intent: ChatIntent;
  searchQuery?: string;
  suggestions: string[];
} {
  // Detect intent
  const intent = detectIntent(message);
  
  // Parse search query if it's a search intent
  let searchQuery: string | undefined;
  if (intent.type === "search") {
    const parsed = parseNaturalLanguageQuery(message);
    if (parsed.confidence > 30) {
      searchQuery = describeQuery(parsed);
    }
  }
  
  // Generate response
  const response = generateResponse(intent, {
    ...context,
    lastSearchQuery: searchQuery,
    city: intent.entities.city as string,
    district: intent.entities.district as string,
  });
  
  // Generate suggestions
  const suggestions = generateSearchSuggestions(conversationHistory);
  
  return {
    response,
    intent,
    searchQuery,
    suggestions,
  };
}

/**
 * Generate help text for the chat assistant
 */
export function getHelpText(): string {
  return `🏠 **Sara Uylar AI Yordamchisi**

Men sizga quyidagi mavzularda yordam bera olaman:

🔍 **E'lon qidirish**
"Toshkentda 3 xonali kvartira", "Chilonzorda arzon uy"

💰 **Narx tahlili**
"Yunusobodda narxlar qanday?", "O'rtacha narx necha?"

📍 **Hudud haqida**
"Sergeli yaxshimi?", "Qaysi tuman yaxshi?"

🏦 **Ipoteka**
"Ipoteka foizlari qanday?", "Oylik to'lov hisoblash"

📈 **Investitsiya**
"Qayerga investitsiya qilish yaxshi?", "ROI qanday?"

Istalgan savolni yozing, men yordam beraman! 🤝`;
}

/**
 * Format property for chat display
 */
export function formatPropertyForChat(property: {
  title: string;
  price: number;
  currency: string;
  rooms: number;
  area: number;
  district: string;
  city: string;
}): string {
  const priceFormatted = property.currency === "UZS" 
    ? `${(property.price / 1_000_000).toFixed(0)} mln so'm`
    : `$${property.price.toLocaleString()}`;
    
  return `🏠 **${property.title}**
📍 ${property.district}, ${property.city}
💰 ${priceFormatted}
🛏️ ${property.rooms} xona • 📐 ${property.area} m²`;
}
