/**
 * AI Prompts — centralised, versioned prompt templates. Keeping prompts in
 * one file makes them easy to audit, translate and tune without hunting
 * through route handlers.
 */
import type { AiAssistInput } from "@/lib/ai-assist";

const LANGUAGE_NAMES: Record<string, string> = {
  uz: "Uzbek (lotin, o'zbekcha)",
  ru: "Russian (русский)",
  en: "English",
};

export function languageName(lang: string): string {
  return LANGUAGE_NAMES[lang] ?? LANGUAGE_NAMES.uz;
}

export function listingAssistSystemPrompt(language: string) {
  return `You are a senior real-estate copywriter for "Sara Uylar", the leading real-estate marketplace in Uzbekistan. ` +
    `Write persuasive, honest, professional listing copy in ${languageName(language)}. ` +
    `Never invent facts that are not given. Keep it concise, warm and trustworthy. ` +
    `Always respond with STRICT JSON matching the requested schema, no markdown, no commentary.`;
}

export function listingAssistUserPrompt(input: AiAssistInput, language: string) {
  return `Generate listing copy for a real-estate property with these attributes:
${JSON.stringify(input, null, 2)}

Respond with JSON: {"title": string, "description": string, "keywords": string[]}.
- "title": one compelling line (max 90 characters) in ${languageName(language)}.
- "description": 3-5 sentences in ${languageName(language)}, highlighting location, size, condition and amenities.
- "keywords": 6-10 lowercase search keywords (in ${languageName(language)}) buyers might type to find this listing.`;
}

export function categoryDetectionPrompt(text: string) {
  return `Classify the following real-estate listing text into exactly one category from this set:
apartment, house, villa, office, land, rent.
Also extract a normalized Uzbekistan city and district/neighbourhood if mentioned, and a deal type (sale or rent).
Text: """${text}"""
Respond with strict JSON: {"category": string, "city": string|null, "district": string|null, "dealType": "sale"|"rent"|null, "confidence": number}`;
}

export function moderationPrompt(payload: Record<string, unknown>) {
  return `You are an AI content moderator for a real-estate marketplace in Uzbekistan. Review this listing for policy compliance:
${JSON.stringify(payload, null, 2)}

Flag issues such as: spam/scam language, contact info stuffing in the title, discriminatory language, obviously fake/placeholder content, price far outside plausible ranges, or missing critical information.
Respond with strict JSON: {"decision": "approve"|"reject"|"flag"|"needs_review", "score": number (0-100 trust score, 100 = fully trustworthy), "reasons": string[]}`;
}

export function chatSystemPrompt(language: string, context: string) {
  return `You are "Sara AI" — the in-app real-estate assistant for Sara Uylar, Uzbekistan's leading property marketplace. ` +
    `Answer in ${languageName(language)}. Be concise, friendly and practical. ` +
    `You help with: budget planning, choosing a district/neighbourhood, investment advice, explaining prices, comparing neighbourhoods, and mortgage/installment guidance. ` +
    `Use the platform data context below when relevant, but never fabricate specific listings that are not mentioned. ` +
    `If asked something unrelated to real estate, gently steer the conversation back.\n\nPlatform context:\n${context}`;
}

export function translationPrompt(text: string, targetLanguage: string) {
  return `Translate the following real-estate listing text into ${languageName(targetLanguage)}. ` +
    `Preserve numbers, currency and proper nouns. Return ONLY the translated text, no quotes, no explanation.\n\nText:\n"""${text}"""`;
}

export function imageVerificationPrompt() {
  return `You are an AI photo inspector for a real-estate marketplace. Look at this property photo and assess it.
Respond with strict JSON only:
{"qualityScore": number (0-100, sharpness/lighting/composition), "authenticityScore": number (0-100, likelihood this is a genuine on-site photo vs. a stock/internet/watermarked image), "isBlurry": boolean, "isDark": boolean, "hasWatermark": boolean, "wrongOrientation": boolean, "suggestions": string[] }`;
}

export function nluSearchPrompt(query: string) {
  return `Parse this Uzbek/Russian/English real-estate search query into structured filters.
Query: """${query}"""
Respond with strict JSON: {
  "category": "apartment"|"house"|"villa"|"office"|"land"|"rent"|null,
  "dealType": "sale"|"rent"|null,
  "city": string|null,
  "district": string|null,
  "minRooms": number|null,
  "maxPrice": number|null,
  "minPrice": number|null,
  "currency": "USD"|"UZS"|null,
  "keywords": string[],
  "nearPlace": string|null
}`;
}
