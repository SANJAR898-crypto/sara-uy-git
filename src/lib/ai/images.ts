/**
 * Sara Uylar — AI Image Verification Service (Phase 6)
 * Advanced image analysis for duplicate detection, watermarks, etc.
 */

import type { ImageVerificationResult } from "./types";

// Known stock image patterns
const STOCK_IMAGE_PATTERNS = [
  /shutterstock/i,
  /gettyimages/i,
  /istockphoto/i,
  /depositphotos/i,
  /123rf/i,
  /adobe\.?stock/i,
  /dreamstime/i,
  /canva/i,
  /unsplash.*random/i,
  /placeholder/i,
  /via\.placeholder/i,
  /picsum\.photos/i,
  /lorempixel/i,
  /dummyimage/i,
];

// Suspicious URL patterns that might indicate stolen images
const SUSPICIOUS_PATTERNS = [
  /olx\./i,
  /avito\./i,
  /craigslist/i,
  /zillow/i,
  /realtor\.com/i,
  /redfin/i,
  /trulia/i,
  /cian\.ru/i,
  /yandex.*realty/i,
];

// Trusted image hosting domains
const TRUSTED_HOSTS = [
  "images.pexels.com",
  "images.unsplash.com",
  "i.pravatar.cc",
  "telegram.org",
  "t.me",
  "telegra.ph",
  "ucarecdn.com",
  "cloudinary.com",
  "res.cloudinary.com",
  "imagekit.io",
  "imgix.net",
];

// Watermark detection patterns in filenames
const WATERMARK_PATTERNS = [
  /watermark/i,
  /logo/i,
  /marked/i,
  /sample/i,
  /preview/i,
  /draft/i,
];

// Calculate image hash for duplicate detection (simplified)
function simpleHash(url: string): string {
  let hash = 0;
  const str = url.toLowerCase().replace(/[?#].*$/, "");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Extract filename from URL
function getFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "";
  } catch {
    return url.split("/").pop() || "";
  }
}

// Check if URL looks like a valid image
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  
  // Allow local paths
  if (url.startsWith("/")) return true;
  
  // Check for valid URL
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// Check for image extension
function hasImageExtension(url: string): boolean {
  const imageExtensions = /\.(jpe?g|png|webp|avif|gif|heic|heif)(\?.*)?$/i;
  return imageExtensions.test(url);
}

// Check for suspicious editing patterns
function detectSuspiciousEdit(url: string): boolean {
  const editPatterns = [
    /edit/i,
    /modified/i,
    /altered/i,
    /processed/i,
    /enhanced/i,
    /photoshop/i,
    /ps_/i,
  ];
  
  const filename = getFilename(url);
  return editPatterns.some(p => p.test(filename));
}

/**
 * Verify images for potential issues
 */
export function verifyImages(images: string[]): ImageVerificationResult {
  const result: ImageVerificationResult = {
    verified: true,
    overallConfidence: 100,
    images: [],
    summary: {
      totalImages: images.length,
      passedImages: 0,
      warningImages: 0,
      failedImages: 0,
      duplicatesFound: 0,
      internetImagesFound: 0,
      watermarksFound: 0,
    },
  };

  if (!images || images.length === 0) {
    return {
      ...result,
      verified: false,
      overallConfidence: 0,
      images: [{
        url: "",
        status: "failed",
        issues: [{
          type: "low_quality",
          confidence: 100,
          message: "Hech qanday rasm yuklanmagan",
        }],
      }],
    };
  }

  // Track seen hashes for duplicate detection
  const seenHashes = new Map<string, number>();
  
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const imageResult: ImageVerificationResult["images"][0] = {
      url,
      status: "passed",
      issues: [],
    };

    // Check for valid URL
    if (!isValidImageUrl(url)) {
      imageResult.status = "failed";
      imageResult.issues.push({
        type: "low_quality",
        confidence: 100,
        message: "Yaroqsiz rasm URL manzili",
      });
      result.summary.failedImages++;
      result.images.push(imageResult);
      continue;
    }

    // Check for duplicates within the same listing
    const hash = simpleHash(url);
    if (seenHashes.has(hash)) {
      imageResult.status = "warning";
      imageResult.issues.push({
        type: "duplicate",
        confidence: 95,
        message: `Rasm ${seenHashes.get(hash)! + 1}-rasm bilan bir xil`,
      });
      result.summary.duplicatesFound++;
    }
    seenHashes.set(hash, i);

    // Check for stock images
    const isStockImage = STOCK_IMAGE_PATTERNS.some(p => p.test(url));
    if (isStockImage) {
      imageResult.status = "failed";
      imageResult.issues.push({
        type: "internet",
        confidence: 90,
        message: "Stock rasm kutubxonasidan olingan",
      });
      result.summary.internetImagesFound++;
    }

    // Check for suspicious sources (other real estate sites)
    const isSuspiciousSource = SUSPICIOUS_PATTERNS.some(p => p.test(url));
    if (isSuspiciousSource) {
      imageResult.status = "failed";
      imageResult.issues.push({
        type: "internet",
        confidence: 85,
        message: "Rasm boshqa ko'chmas mulk saytidan olingan bo'lishi mumkin",
      });
      result.summary.internetImagesFound++;
    }

    // Check for watermarks in filename
    const filename = getFilename(url);
    const hasWatermark = WATERMARK_PATTERNS.some(p => p.test(filename));
    if (hasWatermark) {
      imageResult.status = "warning";
      imageResult.issues.push({
        type: "watermark",
        confidence: 70,
        message: "Rasmda vodopad belgisi bo'lishi mumkin",
      });
      result.summary.watermarksFound++;
    }

    // Check for suspicious edits
    if (detectSuspiciousEdit(url)) {
      imageResult.status = "warning";
      imageResult.issues.push({
        type: "suspicious_edit",
        confidence: 60,
        message: "Rasm tahrirlangan bo'lishi mumkin",
      });
    }

    // Check if it's from a trusted host
    let isTrustedHost = false;
    try {
      const hostname = new URL(url).hostname;
      isTrustedHost = TRUSTED_HOSTS.some(h => hostname.endsWith(h));
    } catch {
      // Invalid URL, already handled
    }

    // Check for proper image extension
    if (!url.startsWith("/") && !hasImageExtension(url) && !isTrustedHost) {
      imageResult.status = "warning";
      imageResult.issues.push({
        type: "low_quality",
        confidence: 50,
        message: "Rasm formati aniqlanmadi",
      });
    }

    // Update status based on issues
    if (imageResult.issues.length === 0) {
      imageResult.status = "passed";
      result.summary.passedImages++;
    } else if (imageResult.status !== "failed") {
      if (imageResult.issues.some(i => i.confidence >= 80)) {
        imageResult.status = "failed";
        result.summary.failedImages++;
      } else {
        imageResult.status = "warning";
        result.summary.warningImages++;
      }
    }

    result.images.push(imageResult);
  }

  // Calculate overall confidence
  const passedRatio = result.summary.passedImages / images.length;
  const warningPenalty = result.summary.warningImages * 5;
  const failedPenalty = result.summary.failedImages * 15;
  
  result.overallConfidence = Math.max(0, Math.round(passedRatio * 100 - warningPenalty - failedPenalty));
  result.verified = result.overallConfidence >= 70;

  return result;
}

/**
 * Quick check if images are acceptable
 */
export function quickImageCheck(images: string[]): {
  passed: boolean;
  message: string;
} {
  if (!images || images.length === 0) {
    return {
      passed: false,
      message: "Kamida bitta rasm kerak",
    };
  }

  if (images.length < 3) {
    return {
      passed: true,
      message: "Kamida 3 ta rasm qo'shish tavsiya etiladi",
    };
  }

  const result = verifyImages(images);
  
  if (!result.verified) {
    return {
      passed: false,
      message: `${result.summary.failedImages} ta muammoli rasm aniqlandi`,
    };
  }

  if (result.summary.warningImages > 0) {
    return {
      passed: true,
      message: `${result.summary.warningImages} ta ogohlantirishli rasm`,
    };
  }

  return {
    passed: true,
    message: "Barcha rasmlar tekshiruvdan o'tdi",
  };
}

/**
 * Calculate image quality score for a listing
 */
export function calculateImageScore(images: string[]): {
  score: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 100;

  if (!images || images.length === 0) {
    return { score: 0, suggestions: ["Rasm qo'shing"] };
  }

  // Check count
  if (images.length < 3) {
    score -= 20;
    suggestions.push("Kamida 3 ta rasm qo'shing");
  } else if (images.length < 5) {
    score -= 10;
    suggestions.push("5+ ta rasm qo'shish ko'rinishni yaxshilaydi");
  } else if (images.length >= 8) {
    score += 5; // Bonus for lots of images
  }

  // Verify images
  const verification = verifyImages(images);
  
  score -= verification.summary.warningImages * 5;
  score -= verification.summary.failedImages * 15;
  score -= verification.summary.duplicatesFound * 10;

  if (verification.summary.duplicatesFound > 0) {
    suggestions.push("Takroriy rasmlarni olib tashlang");
  }

  if (verification.summary.internetImagesFound > 0) {
    suggestions.push("Haqiqiy mulk rasmlarini yuklang");
  }

  if (verification.summary.watermarksFound > 0) {
    suggestions.push("Vodopad belgisiz rasmlar yuklang");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
  };
}
