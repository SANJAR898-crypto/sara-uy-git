/**
 * Sara Uylar — AI Listing Quality Score Service (Phase 6)
 * Comprehensive quality analysis for property listings
 */

import type { Property } from "@/types";
import type { ListingQualityScore } from "./types";
import { calculateImageScore } from "./images";

// SEO keyword patterns
const SEO_KEYWORDS: Record<string, string[]> = {
  apartment: ["kvartira", "xonadon", "uy", "yangi qurilish", "ipoteka", "muddatli"],
  house: ["hovli", "uy", "villa", "hashamatli", "keng", "bog"],
  office: ["ofis", "biznes", "markaz", "ish joyi"],
  land: ["yer", "uchastkasi", "sotix", "qurilish uchun"],
  villa: ["villa", "hashamat", "premium", "zamonaviy"],
  rent: ["ijara", "arenda", "kunlik", "oylik"],
};

const QUALITY_KEYWORDS = [
  "yangi", "zamonaviy", "euro", "remont", "mebel", "konditsioner",
  "parking", "lift", "qorovul", "hovli", "balkon", "basseyn",
];

/**
 * Analyze title quality
 */
function analyzeTitle(title: string): {
  score: number;
  issues: ListingQualityScore["issues"];
} {
  const issues: ListingQualityScore["issues"] = [];
  let score = 100;

  if (!title || title.trim().length === 0) {
    return {
      score: 0,
      issues: [{
        field: "title",
        severity: "error",
        message: "Sarlavha kiritilmagan",
        suggestion: "Qisqa va tushunarli sarlavha yozing",
      }],
    };
  }

  const length = title.length;

  // Too short
  if (length < 15) {
    score -= 30;
    issues.push({
      field: "title",
      severity: "warning",
      message: "Sarlavha juda qisqa",
      suggestion: "Kamida 20 belgidan iborat sarlavha yozing",
    });
  }

  // Too long
  if (length > 100) {
    score -= 15;
    issues.push({
      field: "title",
      severity: "warning",
      message: "Sarlavha juda uzun",
      suggestion: "Sarlavhani 80 belgigacha qisqartiring",
    });
  }

  // Check for caps lock
  const capsRatio = (title.match(/[A-Z]/g) || []).length / length;
  if (capsRatio > 0.5) {
    score -= 20;
    issues.push({
      field: "title",
      severity: "warning",
      message: "Juda ko'p katta harflar",
      suggestion: "Oddiy yozuv uslubidan foydalaning",
    });
  }

  // Check for special characters spam
  const specialChars = (title.match(/[!@#$%^&*()_+=<>?]/g) || []).length;
  if (specialChars > 3) {
    score -= 15;
    issues.push({
      field: "title",
      severity: "warning",
      message: "Ko'p maxsus belgilar",
      suggestion: "Maxsus belgilarni kamaytiring",
    });
  }

  // Check for quality keywords
  const hasQualityKeyword = QUALITY_KEYWORDS.some(kw => 
    title.toLowerCase().includes(kw)
  );
  if (hasQualityKeyword) {
    score += 5;
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

/**
 * Analyze description quality
 */
function analyzeDescription(description: string, category: string): {
  score: number;
  issues: ListingQualityScore["issues"];
  seoKeywords: string[];
} {
  const issues: ListingQualityScore["issues"] = [];
  const seoKeywords: string[] = [];
  let score = 100;

  if (!description || description.trim().length === 0) {
    return {
      score: 0,
      issues: [{
        field: "description",
        severity: "error",
        message: "Tavsif yozilmagan",
        suggestion: "Batafsil tavsif qo'shing — bu ko'rinishni 3x oshiradi",
      }],
      seoKeywords: [],
    };
  }

  const length = description.length;

  // Too short
  if (length < 50) {
    score -= 40;
    issues.push({
      field: "description",
      severity: "error",
      message: "Tavsif juda qisqa",
      suggestion: "Kamida 100 belgidan iborat tavsif yozing",
    });
  } else if (length < 100) {
    score -= 20;
    issues.push({
      field: "description",
      severity: "warning",
      message: "Tavsif qisqa",
      suggestion: "Batafsil ma'lumot qo'shing",
    });
  }

  // Good length bonus
  if (length >= 200) {
    score += 10;
  }

  // Check for SEO keywords
  const categoryKeywords = SEO_KEYWORDS[category] || [];
  for (const keyword of [...categoryKeywords, ...QUALITY_KEYWORDS]) {
    if (description.toLowerCase().includes(keyword)) {
      seoKeywords.push(keyword);
    }
  }

  if (seoKeywords.length === 0) {
    score -= 15;
    issues.push({
      field: "description",
      severity: "warning",
      message: "SEO kalit so'zlar topilmadi",
      suggestion: `Quyidagi so'zlardan foydalaning: ${categoryKeywords.slice(0, 3).join(", ")}`,
    });
  } else if (seoKeywords.length >= 3) {
    score += 10;
  }

  // Check for phone numbers (should use contact fields)
  const hasPhoneInText = /\+?998\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/.test(description);
  if (hasPhoneInText) {
    issues.push({
      field: "description",
      severity: "warning",
      message: "Tavsifda telefon raqami",
      suggestion: "Telefon raqamini aloqa maydonlariga kiriting",
    });
  }

  // Check for paragraphs (good formatting)
  const paragraphs = description.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length >= 2) {
    score += 5;
  }

  return { score: Math.max(0, Math.min(100, score)), issues, seoKeywords };
}

/**
 * Analyze pricing quality
 */
function analyzePricing(
  price: number,
  category: string,
  dealType: string
): {
  score: number;
  issues: ListingQualityScore["issues"];
} {
  const issues: ListingQualityScore["issues"] = [];
  let score = 100;

  if (!price || price <= 0) {
    return {
      score: 0,
      issues: [{
        field: "price",
        severity: "error",
        message: "Narx kiritilmagan",
        suggestion: "Raqobatbardosh narx belgilang",
      }],
    };
  }

  // Check for unrealistic prices
  const minPrices: Record<string, number> = {
    apartment: 5000,
    house: 10000,
    villa: 50000,
    office: 5000,
    land: 1000,
    rent: 50,
  };

  const maxPrices: Record<string, number> = {
    apartment: 2000000,
    house: 5000000,
    villa: 10000000,
    office: 3000000,
    land: 20000000,
    rent: 50000,
  };

  const minPrice = minPrices[category] ?? 1000;
  const maxPrice = maxPrices[category] ?? 10000000;

  if (price < minPrice) {
    score -= 30;
    issues.push({
      field: "price",
      severity: "warning",
      message: "Narx juda past ko'rinadi",
      suggestion: "Bozor narxlarini tekshiring",
    });
  }

  if (price > maxPrice) {
    score -= 30;
    issues.push({
      field: "price",
      severity: "warning",
      message: "Narx juda yuqori ko'rinadi",
      suggestion: "Raqobatbardosh narx belgilang",
    });
  }

  // Check for round numbers (good)
  if (price % 1000 === 0) {
    score += 5;
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

/**
 * Analyze completeness of listing fields
 */
function analyzeCompleteness(listing: Partial<Property>): {
  score: number;
  issues: ListingQualityScore["issues"];
} {
  const issues: ListingQualityScore["issues"] = [];
  let filledCount = 0;
  const requiredFields = [
    { key: "title", label: "Sarlavha" },
    { key: "description", label: "Tavsif" },
    { key: "price", label: "Narx" },
    { key: "city", label: "Shahar" },
    { key: "district", label: "Tuman" },
    { key: "rooms", label: "Xonalar" },
    { key: "area", label: "Maydon" },
    { key: "images", label: "Rasmlar" },
  ];

  const optionalFields = [
    { key: "floor", label: "Qavat" },
    { key: "totalFloors", label: "Umumiy qavatlar" },
    { key: "bathrooms", label: "Hammom" },
    { key: "yearBuilt", label: "Qurilgan yili" },
    { key: "heating", label: "Isitish" },
    { key: "furniture", label: "Mebel" },
    { key: "address", label: "Aniq manzil" },
    { key: "contactPhone", label: "Telefon" },
  ];

  // Check required fields
  for (const { key, label } of requiredFields) {
    const value = listing[key as keyof Property];
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      filledCount++;
    } else {
      issues.push({
        field: key,
        severity: "error",
        message: `${label} kiritilmagan`,
        suggestion: `${label}ni to'ldiring`,
      });
    }
  }

  // Check optional fields
  for (const { key, label } of optionalFields) {
    const value = listing[key as keyof Property];
    if (value) {
      filledCount++;
    }
  }

  const totalFields = requiredFields.length + optionalFields.length;
  const score = Math.round((filledCount / totalFields) * 100);

  // Add suggestion for low completeness
  if (score < 60) {
    issues.push({
      field: "completeness",
      severity: "warning",
      message: "E'lon to'liq to'ldirilmagan",
      suggestion: "Barcha maydonlarni to'ldirish ko'rinishni oshiradi",
    });
  }

  return { score, issues };
}

/**
 * Calculate SEO score
 */
function calculateSeoScore(
  title: string,
  description: string,
  category: string,
  keywords: string[]
): number {
  let score = 50; // Base score

  // Title length optimization (50-60 chars ideal for search)
  if (title.length >= 30 && title.length <= 70) {
    score += 15;
  }

  // Description length (150+ chars good for snippets)
  if (description.length >= 150) {
    score += 15;
  }

  // Keyword usage
  score += Math.min(20, keywords.length * 5);

  // Category keyword in title
  const categoryKeywords = SEO_KEYWORDS[category] || [];
  const titleLower = title.toLowerCase();
  if (categoryKeywords.some(kw => titleLower.includes(kw))) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Calculate overall listing quality score
 */
export function calculateListingQuality(
  listing: Partial<Property>
): ListingQualityScore {
  const allIssues: ListingQualityScore["issues"] = [];
  
  // Analyze each aspect
  const titleAnalysis = analyzeTitle(listing.title || "");
  allIssues.push(...titleAnalysis.issues);

  const descAnalysis = analyzeDescription(
    listing.description || "",
    listing.category || "apartment"
  );
  allIssues.push(...descAnalysis.issues);

  const pricingAnalysis = analyzePricing(
    Number(listing.price) || 0,
    listing.category || "apartment",
    listing.dealType || "sale"
  );
  allIssues.push(...pricingAnalysis.issues);

  const imageAnalysis = calculateImageScore(listing.images || []);
  if (imageAnalysis.suggestions.length > 0) {
    allIssues.push({
      field: "images",
      severity: "warning",
      message: "Rasmlarni yaxshilash mumkin",
      suggestion: imageAnalysis.suggestions[0],
    });
  }

  const completenessAnalysis = analyzeCompleteness(listing);
  allIssues.push(...completenessAnalysis.issues);

  // Calculate SEO score
  const seoScore = calculateSeoScore(
    listing.title || "",
    listing.description || "",
    listing.category || "apartment",
    descAnalysis.seoKeywords
  );

  // Calculate overall score (weighted average)
  const overall = Math.round(
    titleAnalysis.score * 0.2 +
    descAnalysis.score * 0.25 +
    imageAnalysis.score * 0.25 +
    pricingAnalysis.score * 0.15 +
    completenessAnalysis.score * 0.15
  );

  // Determine visibility
  let estimatedVisibility: "low" | "medium" | "high" = "medium";
  if (overall >= 80) estimatedVisibility = "high";
  else if (overall < 50) estimatedVisibility = "low";

  return {
    overall,
    breakdown: {
      title: titleAnalysis.score,
      description: descAnalysis.score,
      images: imageAnalysis.score,
      pricing: pricingAnalysis.score,
      completeness: completenessAnalysis.score,
      seo: seoScore,
    },
    issues: allIssues,
    seoKeywords: descAnalysis.seoKeywords,
    estimatedVisibility,
  };
}

/**
 * Get quality improvement suggestions
 */
export function getQualityImprovements(
  score: ListingQualityScore
): Array<{
  priority: number;
  action: string;
  impact: string;
}> {
  const improvements: Array<{
    priority: number;
    action: string;
    impact: string;
  }> = [];

  // Prioritize based on scores
  if (score.breakdown.images < 60) {
    improvements.push({
      priority: 1,
      action: "Kamida 5 ta sifatli rasm qo'shing",
      impact: "Ko'rinishni 50% oshiradi",
    });
  }

  if (score.breakdown.description < 60) {
    improvements.push({
      priority: 2,
      action: "Batafsil tavsif yozing (200+ belgi)",
      impact: "Qidiruv reytingini yaxshilaydi",
    });
  }

  if (score.breakdown.title < 60) {
    improvements.push({
      priority: 3,
      action: "Sarlavhani optimallashtiring",
      impact: "Bosish koeffitsientini oshiradi",
    });
  }

  if (score.breakdown.completeness < 70) {
    improvements.push({
      priority: 4,
      action: "Barcha maydonlarni to'ldiring",
      impact: "Ishonchni oshiradi",
    });
  }

  if (score.breakdown.seo < 50) {
    improvements.push({
      priority: 5,
      action: "SEO kalit so'zlardan foydalaning",
      impact: "Qidiruv natijalarida yuqoriroq o'rin",
    });
  }

  return improvements.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate AI title based on listing data
 */
export function generateAiTitle(listing: {
  category: string;
  dealType: string;
  city: string;
  district?: string;
  rooms?: number;
  area?: number;
}): string {
  const categoryLabels: Record<string, string> = {
    apartment: "Kvartira",
    house: "Uy",
    villa: "Villa",
    office: "Ofis",
    land: "Yer uchastkasi",
    rent: "Ijara uchun",
  };

  const dealLabels: Record<string, string> = {
    sale: "sotiladi",
    rent: "ijaraga beriladi",
  };

  const parts: string[] = [];

  // Location
  parts.push(listing.district || listing.city);

  // Rooms
  if (listing.rooms) {
    parts.push(`${listing.rooms} xonali`);
  }

  // Category
  parts.push(categoryLabels[listing.category] || "Ko'chmas mulk");

  // Deal type
  parts.push(dealLabels[listing.dealType] || "sotiladi");

  // Area
  if (listing.area) {
    parts.push(`${listing.area} m²`);
  }

  return parts.join(" ");
}

/**
 * Generate AI description based on listing data
 */
export function generateAiDescription(listing: {
  category: string;
  dealType: string;
  city: string;
  district?: string;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  amenities?: Record<string, boolean>;
}): string {
  const categoryLabels: Record<string, string> = {
    apartment: "Kvartira",
    house: "Uy",
    villa: "Villa",
    office: "Ofis",
    land: "Yer uchastkasi",
    rent: "Ijara uchun",
  };

  const amenityLabels: Record<string, string> = {
    parking: "avtostoyanka",
    balcony: "balkon",
    garden: "hovli",
    pool: "basseyn",
    security: "qorovul xizmati",
    internet: "internet",
    ac: "konditsioner",
  };

  const parts: string[] = [];

  // Opening
  const catLabel = categoryLabels[listing.category] || "Ko'chmas mulk";
  parts.push(`${catLabel} ${listing.city}${listing.district ? `, ${listing.district}` : ""} hududida joylashgan.`);

  // Size info
  if (listing.rooms || listing.area) {
    const sizeParts: string[] = [];
    if (listing.rooms) sizeParts.push(`${listing.rooms} xonali`);
    if (listing.area) sizeParts.push(`${listing.area} m² maydonga ega`);
    parts.push(sizeParts.join(", ") + ".");
  }

  // Floor info
  if (listing.floor && listing.totalFloors) {
    parts.push(`${listing.floor}-qavat, ${listing.totalFloors} qavatli binoda.`);
  }

  // Amenities
  if (listing.amenities) {
    const activeAmenities = Object.entries(listing.amenities)
      .filter(([, v]) => v)
      .map(([k]) => amenityLabels[k] || k);
    
    if (activeAmenities.length > 0) {
      parts.push(`Qulayliklar: ${activeAmenities.join(", ")}.`);
    }
  }

  // Closing
  parts.push("Barcha kerakli infratuzilma yaqin atrofda mavjud.");

  return parts.join(" ");
}

/**
 * Generate AI tags for a listing
 */
export function generateAiTags(listing: {
  category: string;
  dealType: string;
  city: string;
  district?: string;
  rooms?: number;
  amenities?: Record<string, boolean>;
}): string[] {
  const tags = new Set<string>();

  // Category tag
  tags.add(listing.category);

  // Deal type
  tags.add(listing.dealType);

  // Location
  tags.add(listing.city);
  if (listing.district) tags.add(listing.district);

  // Rooms
  if (listing.rooms) tags.add(`${listing.rooms}-xona`);

  // Amenities
  if (listing.amenities) {
    Object.entries(listing.amenities).forEach(([k, v]) => {
      if (v) tags.add(k);
    });
  }

  return Array.from(tags);
}
