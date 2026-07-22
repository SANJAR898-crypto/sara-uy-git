/**
 * AI Listing Score (Seller Agent) — Phase 9
 *
 * Combines title/description quality, photo quality, price positioning
 * against comparable active listings, and profile completeness into a
 * single explainable 0-100 "AI Listing Score" plus actionable improvement
 * suggestions — used by the seller listing wizard before publishing.
 */
import { verifyImagesHeuristic } from "@/lib/ai";
import type { PriceAdviceResult } from "@/lib/ai";

export interface ListingScoreInput {
  title: string;
  description: string;
  images: string[];
  price: number;
  rooms?: number | null;
  area?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  amenities?: Record<string, boolean | undefined>;
  contactPhone?: string | null;
}

export interface ListingScoreBreakdown {
  titleQuality: number;
  descriptionQuality: number;
  imagesQuality: number;
  pricePositioning: number;
  completeness: number;
}

export interface ListingScoreResult {
  overall: number;
  breakdown: ListingScoreBreakdown;
  suggestions: string[];
  grade: "excellent" | "good" | "fair" | "poor";
}

function scoreTitle(title: string): { score: number; tip?: string } {
  const len = title.trim().length;
  if (len === 0) return { score: 0, tip: "Sarlavha kiritilmagan" };
  if (len < 15) return { score: 40, tip: "Sarlavhani kengaytiring: hudud, xonalar soni va afzalliklarni qo'shing" };
  if (len > 90) return { score: 55, tip: "Sarlavha juda uzun — asosiy 8-12 so'zga qisqartiring" };
  return { score: 95 };
}

function scoreDescription(description: string): { score: number; tip?: string } {
  const len = description.trim().length;
  const sentences = description.split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  if (len === 0) return { score: 0, tip: "Tavsif kiritilmagan" };
  if (len < 60) return { score: 35, tip: "Tavsifni kengaytiring — infratuzilma, holat va afzalliklarni yozing" };
  if (sentences < 2) return { score: 55, tip: "Tavsifga yana 1-2 gap qo'shing (holat, qulayliklar, atrof-muhit)" };
  return { score: Math.min(100, 70 + sentences * 5) };
}

function scoreImages(images: string[]): { score: number; tip?: string } {
  const verification = verifyImagesHeuristic(images);
  const countScore = Math.min(100, (images.length / 6) * 100);
  const score = Math.round(countScore * 0.5 + verification.confidence * 0.5);
  if (images.length < 3) return { score, tip: "Kamida 5-6 ta sifatli rasm qo'shing — bu ko'rishlarni sezilarli oshiradi" };
  if (verification.confidence < 70) return { score, tip: "Ba'zi rasmlar sifat mezonlaridan o'tmadi — aniqroq, yorug' fotolar yuklang" };
  return { score };
}

function scorePricePositioning(price: number, advice: PriceAdviceResult | null): { score: number; tip?: string } {
  if (!advice) return { score: 60 };
  if (price < advice.low * 0.6) return { score: 50, tip: "Narx bozordan ancha past — bu xaridorlarda shubha uyg'otishi mumkin" };
  if (price > advice.high * 1.3) return { score: 45, tip: "Narx bozor o'rtachasidan sezilarli yuqori — sotilish tezligi pasayishi mumkin" };
  const mid = advice.fair;
  const diff = Math.abs(price - mid) / mid;
  return { score: Math.round(Math.max(40, 100 - diff * 120)) };
}

function scoreCompleteness(input: ListingScoreInput): { score: number; tip?: string } {
  const checks = [
    Boolean(input.rooms),
    Boolean(input.area),
    Boolean(input.floor),
    Boolean(input.yearBuilt),
    Object.values(input.amenities || {}).some(Boolean),
    Boolean(input.contactPhone),
  ];
  const filled = checks.filter(Boolean).length;
  const score = Math.round((filled / checks.length) * 100);
  return { score, tip: score < 70 ? "Xona, maydon, qavat va qulayliklar kabi maydonlarni to'ldiring" : undefined };
}

export function computeListingQualityScore(input: ListingScoreInput, priceAdvice: PriceAdviceResult | null): ListingScoreResult {
  const title = scoreTitle(input.title);
  const description = scoreDescription(input.description);
  const images = scoreImages(input.images || []);
  const price = scorePricePositioning(input.price, priceAdvice);
  const completeness = scoreCompleteness(input);

  const overall = Math.round(
    title.score * 0.2 + description.score * 0.25 + images.score * 0.25 + price.score * 0.2 + completeness.score * 0.1
  );

  const suggestions = [title.tip, description.tip, images.tip, price.tip, completeness.tip].filter(Boolean) as string[];

  const grade: ListingScoreResult["grade"] = overall >= 85 ? "excellent" : overall >= 65 ? "good" : overall >= 45 ? "fair" : "poor";

  return {
    overall: Math.max(0, Math.min(100, overall)),
    breakdown: {
      titleQuality: title.score,
      descriptionQuality: description.score,
      imagesQuality: images.score,
      pricePositioning: price.score,
      completeness: completeness.score,
    },
    suggestions,
    grade,
  };
}
