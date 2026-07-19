/**
 * Sara Uylar — AI Moderation Service (Phase 6)
 * Automatic detection of spam, fake listings, and policy violations
 */

import type { Property } from "@/types";
import type { ModerationResult } from "./types";
import { verifyImages } from "./images";

// Spam keywords (Uzbek and Russian)
const SPAM_KEYWORDS = [
  /срочно/i,
  /urgent/i,
  /shoshilinch/i,
  /зайдите/i,
  /перейдите/i,
  /ссылк/i,
  /link/i,
  /telegram.*@/i,
  /whatsapp.*\+/i,
  /viber/i,
  /бесплатн/i,
  /tekin/i,
  /халява/i,
  /выигры/i,
  /yutib\s*ol/i,
  /www\./i,
  /http/i,
  /\.com/i,
  /\.ru/i,
  /криптовалют/i,
  /bitcoin/i,
  /casino/i,
  /kazino/i,
  /betting/i,
  /pul\s*ishlash/i,
  /daromad/i,
];

// Suspicious price thresholds by category (in USD)
const PRICE_LIMITS: Record<string, { min: number; max: number }> = {
  apartment: { min: 5000, max: 2000000 },
  house: { min: 10000, max: 5000000 },
  villa: { min: 50000, max: 10000000 },
  office: { min: 5000, max: 3000000 },
  land: { min: 1000, max: 20000000 },
  rent: { min: 50, max: 50000 },
};

// Minimum description length for quality
const MIN_DESCRIPTION_LENGTH = 30;

// Maximum listings per day per seller (spam protection)
const MAX_LISTINGS_PER_DAY = 20;

/**
 * Check if text contains spam keywords
 */
function detectSpam(text: string): { isSpam: boolean; matches: string[] } {
  const matches: string[] = [];
  
  for (const pattern of SPAM_KEYWORDS) {
    if (pattern.test(text)) {
      matches.push(pattern.source);
    }
  }
  
  return {
    isSpam: matches.length > 0,
    matches,
  };
}

/**
 * Check if price is realistic for category
 */
function checkPriceRealism(
  price: number,
  category: string,
  dealType: string
): { realistic: boolean; reason?: string } {
  const limits = PRICE_LIMITS[category] ?? PRICE_LIMITS.apartment;
  
  // Adjust for rent vs sale
  let minPrice = limits.min;
  let maxPrice = limits.max;
  
  if (dealType === "rent") {
    // Rent prices are monthly, much lower
    minPrice = 50;
    maxPrice = 50000;
  }
  
  if (price < minPrice) {
    return {
      realistic: false,
      reason: `Narx juda past (${price} < ${minPrice})`,
    };
  }
  
  if (price > maxPrice) {
    return {
      realistic: false,
      reason: `Narx juda yuqori (${price} > ${maxPrice})`,
    };
  }
  
  return { realistic: true };
}

/**
 * Detect duplicate or similar listings
 */
function detectDuplicate(
  listing: Partial<Property>,
  existingListings: Property[]
): { isDuplicate: boolean; similarId?: string; similarity: number } {
  if (existingListings.length === 0) {
    return { isDuplicate: false, similarity: 0 };
  }

  for (const existing of existingListings) {
    let similarity = 0;
    
    // Same title (normalized)
    if (listing.title && existing.title) {
      const titleA = listing.title.toLowerCase().replace(/\s+/g, " ").trim();
      const titleB = existing.title.toLowerCase().replace(/\s+/g, " ").trim();
      if (titleA === titleB) similarity += 40;
    }
    
    // Same location
    if (listing.city === existing.city && listing.district === existing.district) {
      similarity += 20;
    }
    
    // Same address
    if (listing.address && existing.address && listing.address === existing.address) {
      similarity += 30;
    }
    
    // Same price
    if (listing.price && Math.abs(Number(listing.price) - existing.price) < 100) {
      similarity += 10;
    }
    
    // Very similar = duplicate
    if (similarity >= 70) {
      return {
        isDuplicate: true,
        similarId: existing.id,
        similarity,
      };
    }
  }
  
  return { isDuplicate: false, similarity: 0 };
}

/**
 * Check listing quality and completeness
 */
function checkQuality(listing: Partial<Property>): {
  quality: "low" | "medium" | "high";
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;
  
  // Title check
  if (!listing.title || listing.title.length < 10) {
    issues.push("Sarlavha juda qisqa");
    score -= 20;
  }
  
  // Description check
  if (!listing.description || listing.description.length < MIN_DESCRIPTION_LENGTH) {
    issues.push("Tavsif yetarli emas");
    score -= 15;
  }
  
  // Images check
  const images = listing.images ?? [];
  if (images.length === 0) {
    issues.push("Rasm yo'q");
    score -= 25;
  } else if (images.length < 3) {
    issues.push("Rasmlar kam (kamida 3 ta tavsiya)");
    score -= 10;
  }
  
  // Location check
  if (!listing.city || !listing.district) {
    issues.push("Joylashuv to'liq emas");
    score -= 15;
  }
  
  // Price check
  if (!listing.price || Number(listing.price) <= 0) {
    issues.push("Narx kiritilmagan");
    score -= 20;
  }
  
  // Contact info
  if (!listing.contactPhone && !listing.contactTelegram) {
    issues.push("Bog'lanish ma'lumoti yo'q");
    score -= 10;
  }
  
  const quality: "low" | "medium" | "high" = 
    score >= 80 ? "high" : score >= 50 ? "medium" : "low";
  
  return { quality, issues };
}

/**
 * Moderate a property listing
 */
export function moderateListing(
  listing: Partial<Property>,
  existingListings: Property[] = [],
  sellerListingsToday = 0
): ModerationResult {
  const flags: ModerationResult["flags"] = [];
  let confidence = 100;

  // Check for spam
  const fullText = `${listing.title || ""} ${listing.description || ""}`;
  const spamCheck = detectSpam(fullText);
  if (spamCheck.isSpam) {
    flags.push({
      type: "spam",
      severity: "high",
      confidence: 85,
      message: "Spam kalit so'zlari aniqlandi",
      evidence: spamCheck.matches.join(", "),
    });
    confidence -= 30;
  }

  // Check price realism
  if (listing.price && listing.category && listing.dealType) {
    const priceCheck = checkPriceRealism(
      Number(listing.price),
      listing.category,
      listing.dealType
    );
    if (!priceCheck.realistic) {
      flags.push({
        type: "unrealistic_price",
        severity: "high",
        confidence: 90,
        message: "Narx real emas",
        evidence: priceCheck.reason,
      });
      confidence -= 25;
    }
  }

  // Check for duplicates
  const duplicateCheck = detectDuplicate(listing, existingListings);
  if (duplicateCheck.isDuplicate) {
    flags.push({
      type: "duplicate",
      severity: "high",
      confidence: duplicateCheck.similarity,
      message: "O'xshash e'lon mavjud",
      evidence: `E'lon ID: ${duplicateCheck.similarId}`,
    });
    confidence -= 30;
  }

  // Check images
  const images = listing.images ?? [];
  if (images.length > 0) {
    const imageVerification = verifyImages(images);
    if (!imageVerification.verified) {
      if (imageVerification.summary.internetImagesFound > 0) {
        flags.push({
          type: "stolen_images",
          severity: "medium",
          confidence: 75,
          message: "Internetdan olingan rasmlar aniqlandi",
        });
        confidence -= 20;
      }
      if (imageVerification.summary.duplicatesFound > 0) {
        flags.push({
          type: "duplicate",
          severity: "low",
          confidence: 70,
          message: "Takroriy rasmlar mavjud",
        });
        confidence -= 10;
      }
    }
  }

  // Check seller spam (too many listings)
  if (sellerListingsToday >= MAX_LISTINGS_PER_DAY) {
    flags.push({
      type: "suspicious_user",
      severity: "medium",
      confidence: 80,
      message: "Sotuvchi bugun juda ko'p e'lon joyladi",
      evidence: `${sellerListingsToday} e'lon`,
    });
    confidence -= 15;
  }

  // Check quality
  const qualityCheck = checkQuality(listing);
  if (qualityCheck.quality === "low") {
    flags.push({
      type: "fake",
      severity: "low",
      confidence: 60,
      message: "E'lon sifati past",
      evidence: qualityCheck.issues.join(", "),
    });
    confidence -= 15;
  }

  // Determine suggested action
  let suggestedAction: ModerationResult["suggestedAction"] = "approve";
  let reviewPriority: ModerationResult["reviewPriority"] = "low";
  
  const highSeverityFlags = flags.filter(f => f.severity === "high");
  const mediumSeverityFlags = flags.filter(f => f.severity === "medium");
  
  if (highSeverityFlags.length >= 2) {
    suggestedAction = "reject";
    reviewPriority = "urgent";
  } else if (highSeverityFlags.length === 1) {
    suggestedAction = "review";
    reviewPriority = "high";
  } else if (mediumSeverityFlags.length >= 2) {
    suggestedAction = "review";
    reviewPriority = "medium";
  } else if (flags.length > 0) {
    suggestedAction = "review";
    reviewPriority = "low";
  }

  // Check if seller should be banned
  if (
    flags.some(f => f.type === "spam" && f.severity === "high") &&
    flags.some(f => f.type === "suspicious_user")
  ) {
    suggestedAction = "ban_user";
    reviewPriority = "urgent";
  }

  return {
    approved: suggestedAction === "approve",
    confidence: Math.max(0, confidence),
    flags,
    suggestedAction,
    reviewPriority,
  };
}

/**
 * Batch moderate multiple listings for a seller review
 */
export function batchModerate(
  listings: Property[],
  sellerId: number
): {
  sellerRisk: "low" | "medium" | "high";
  flaggedListings: Array<{ id: string; result: ModerationResult }>;
  recommendations: string[];
} {
  const flaggedListings: Array<{ id: string; result: ModerationResult }> = [];
  let totalFlags = 0;
  let highSeverityCount = 0;
  
  const sellerListings = listings.filter(l => 
    l.seller && Number(l.seller.id) === sellerId
  );
  
  for (const listing of sellerListings) {
    const result = moderateListing(listing, listings, sellerListings.length);
    
    if (result.flags.length > 0) {
      flaggedListings.push({ id: listing.id, result });
      totalFlags += result.flags.length;
      highSeverityCount += result.flags.filter(f => f.severity === "high").length;
    }
  }
  
  // Calculate seller risk
  let sellerRisk: "low" | "medium" | "high" = "low";
  const flagRatio = flaggedListings.length / Math.max(1, sellerListings.length);
  
  if (flagRatio > 0.5 || highSeverityCount >= 3) {
    sellerRisk = "high";
  } else if (flagRatio > 0.2 || highSeverityCount >= 1) {
    sellerRisk = "medium";
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (sellerRisk === "high") {
    recommendations.push("Sotuvchi profilini tekshiring");
    recommendations.push("Barcha e'lonlarni ko'rib chiqing");
  }
  
  if (highSeverityCount > 0) {
    recommendations.push(`${highSeverityCount} ta jiddiy muammo hal qilishni talab qiladi`);
  }
  
  if (flaggedListings.some(f => f.result.flags.some(fl => fl.type === "duplicate"))) {
    recommendations.push("Dublikat e'lonlarni birlashtiring yoki o'chiring");
  }
  
  return {
    sellerRisk,
    flaggedListings,
    recommendations,
  };
}

/**
 * Get priority listings for admin review
 */
export function getPriorityReviewQueue(
  pendingListings: Property[]
): Array<{ listing: Property; priority: ModerationResult["reviewPriority"]; reasons: string[] }> {
  const queue: Array<{ listing: Property; priority: ModerationResult["reviewPriority"]; reasons: string[] }> = [];
  
  for (const listing of pendingListings) {
    const result = moderateListing(listing);
    
    if (result.suggestedAction !== "approve") {
      queue.push({
        listing,
        priority: result.reviewPriority,
        reasons: result.flags.map(f => f.message),
      });
    }
  }
  
  // Sort by priority
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  
  queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return queue;
}
