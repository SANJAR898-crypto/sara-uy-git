/**
 * Sara Uylar — AI Natural Language Search (Phase 6)
 * Converts Uzbek natural language queries into structured filters
 */

import type { ParsedSearchQuery } from "./types";
import type { PropertyCategory, DealType } from "@/types";

// Uzbek keyword mappings
const CATEGORY_KEYWORDS: Record<string, PropertyCategory> = {
  kvartira: "apartment",
  xonadon: "apartment",
  uy: "house",
  hovli: "house",
  villa: "villa",
  hashamat: "villa",
  ofis: "office",
  "ish joy": "office",
  yer: "land",
  "er uchastkasi": "land",
  uchastkasi: "land",
  ijara: "rent",
  ijaraga: "rent",
};

const DEAL_TYPE_KEYWORDS: Record<string, DealType> = {
  sotiladi: "sale",
  sotaman: "sale",
  sotmoqchiman: "sale",
  sotish: "sale",
  sotuv: "sale",
  sotilmoqda: "sale",
  ijara: "rent",
  ijaraga: "rent",
  arenda: "rent",
};

const CITY_KEYWORDS: Record<string, string> = {
  toshkent: "Toshkent",
  tashkent: "Toshkent",
  samarqand: "Samarqand",
  samarkand: "Samarqand",
  buxoro: "Buxoro",
  bukhara: "Buxoro",
  namangan: "Namangan",
  "fargona": "Farg'ona",
  "ferghana": "Farg'ona",
  andijon: "Andijon",
  andijan: "Andijon",
  jizzax: "Jizzax",
  xorazm: "Xorazm",
  "surxondaryo": "Surxondaryo",
  "qashqadaryo": "Qashqadaryo",
  navoi: "Navoiy",
  nukus: "Nukus",
  "qoraqalpog'iston": "Qoraqalpog'iston",
};

const DISTRICT_KEYWORDS: Record<string, string> = {
  yunusobod: "Yunusobod",
  chilonzor: "Chilonzor",
  sergeli: "Sergeli",
  yakkasaroy: "Yakkasaroy",
  mirzo: "Mirzo Ulug'bek",
  "mirzo ulugbek": "Mirzo Ulug'bek",
  shayxontoxur: "Shayxontoxur",
  olmazor: "Olmazor",
  mirobod: "Mirobod",
  uchtepa: "Uchtepa",
  bektemir: "Bektemir",
  yashnobod: "Yashnobod",
  "yangi hayot": "Yangi Hayot",
  "sergeli tumani": "Sergeli",
  "minor": "Minor",
};

const AMENITY_KEYWORDS: Record<string, string> = {
  parking: "parking",
  avtostoyanka: "parking",
  garaj: "parking",
  balkon: "balcony",
  hovli: "garden",
  bog: "garden",
  basseyn: "pool",
  qorovul: "security",
  xavfsizlik: "security",
  internet: "internet",
  wifi: "internet",
  konditsioner: "ac",
  kondish: "ac",
  split: "ac",
};

// Parse price expressions like "700 mln", "500 ming", "$100000"
function parsePrice(text: string): { value: number; isMax: boolean } | null {
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  
  // Patterns to match
  const patterns = [
    // "700 mln gacha" or "700mln gacha"
    /(\d+(?:[.,]\d+)?)\s*(mln|million|mlrd|billion|ming|min)\s*(gacha|dan|dan\s*kam)?/i,
    // "$500000" or "500000$"
    /\$(\d+(?:[.,]\d+)?)/,
    /(\d+(?:[.,]\d+)?)\$/,
    // Plain numbers
    /(\d{5,})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1].replace(",", "."));
      const multiplier = match[2]?.toLowerCase();
      
      if (multiplier === "mln" || multiplier === "million") {
        value *= 1_000_000;
      } else if (multiplier === "mlrd" || multiplier === "billion") {
        value *= 1_000_000_000;
      } else if (multiplier === "ming" || multiplier === "min") {
        value *= 1_000;
      }

      const isMax = /gacha|kam|dan\s*past/i.test(text);
      return { value, isMax };
    }
  }
  
  return null;
}

// Parse room count like "3 xonali", "2-3 xona"
function parseRooms(text: string): { min?: number; max?: number } | null {
  const patterns = [
    /(\d+)\s*-\s*(\d+)\s*xona/i,
    /(\d+)\s*xonali/i,
    /(\d+)\s*xona/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
      }
      const rooms = parseInt(match[1]);
      return { min: rooms, max: rooms };
    }
  }
  
  return null;
}

// Parse area like "100 m2", "60-80 kv"
function parseArea(text: string): { min?: number; max?: number } | null {
  const patterns = [
    /(\d+)\s*-\s*(\d+)\s*(m2|m²|kv|kvadrat)/i,
    /(\d+)\s*(m2|m²|kv|kvadrat)/i,
    /(\d+)\s*sotix/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2] && /^\d+$/.test(match[2])) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
      }
      const area = parseInt(match[1]);
      return { min: area, max: area };
    }
  }
  
  return null;
}

// Find matching keywords in text
function findKeyword<T>(text: string, keywords: Record<string, T>): T | undefined {
  const normalized = text.toLowerCase();
  for (const [key, value] of Object.entries(keywords)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  return undefined;
}

// Find all matching amenities
function findAmenities(text: string): string[] {
  const normalized = text.toLowerCase();
  const found: string[] = [];
  
  for (const [key, value] of Object.entries(AMENITY_KEYWORDS)) {
    if (normalized.includes(key) && !found.includes(value)) {
      found.push(value);
    }
  }
  
  return found;
}

// Extract important keywords for search
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "va", "ham", "bilan", "uchun", "da", "dan", "ga", "ni", "ning",
    "bir", "bu", "u", "men", "kerak", "yaxshi", "yangi", "katta", "kichik",
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
  
  return [...new Set(words)];
}

// Generate search suggestions based on partial query
function generateSuggestions(query: string, parsed: ParsedSearchQuery["filters"]): string[] {
  const suggestions: string[] = [];
  
  if (!parsed.category) {
    suggestions.push("Kvartira yoki uy turini kiriting");
  }
  if (!parsed.city && !parsed.district) {
    suggestions.push("Shahar yoki tuman nomini qo'shing");
  }
  if (!parsed.maxPrice && !parsed.minPrice) {
    suggestions.push("Byudjet oralig'ini belgilang (masalan: 700 mln gacha)");
  }
  
  return suggestions;
}

/**
 * Parse natural language Uzbek search query into structured filters
 * Examples:
 * - "Namanganda 3 xonali hovli 700 mln gacha"
 * - "Chilonzorda yangi qurilgan kvartira"
 * - "Universitetga yaqin arzon uy"
 */
export function parseNaturalLanguageQuery(query: string): ParsedSearchQuery {
  const filters: ParsedSearchQuery["filters"] = {};
  
  // Extract category
  filters.category = findKeyword(query, CATEGORY_KEYWORDS);
  
  // Extract deal type
  filters.dealType = findKeyword(query, DEAL_TYPE_KEYWORDS);
  
  // Extract city
  filters.city = findKeyword(query, CITY_KEYWORDS);
  
  // Extract district
  filters.district = findKeyword(query, DISTRICT_KEYWORDS);
  
  // Extract price
  const priceInfo = parsePrice(query);
  if (priceInfo) {
    if (priceInfo.isMax) {
      filters.maxPrice = priceInfo.value;
    } else {
      filters.minPrice = priceInfo.value;
      filters.maxPrice = priceInfo.value * 1.2; // Add 20% buffer
    }
  }
  
  // Extract rooms
  const roomsInfo = parseRooms(query);
  if (roomsInfo) {
    filters.minRooms = roomsInfo.min;
    filters.maxRooms = roomsInfo.max;
  }
  
  // Extract area
  const areaInfo = parseArea(query);
  if (areaInfo) {
    filters.minArea = areaInfo.min;
    filters.maxArea = areaInfo.max;
  }
  
  // Extract amenities
  filters.amenities = findAmenities(query);
  
  // Extract keywords
  filters.keywords = extractKeywords(query);
  
  // Calculate confidence based on how much was parsed
  const filledFilters = Object.values(filters).filter(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;
  const confidence = Math.min(100, (filledFilters / 8) * 100);
  
  // Generate suggestions for incomplete queries
  const suggestions = generateSuggestions(query, filters);
  
  return {
    query,
    filters,
    confidence: Math.round(confidence),
    suggestions,
  };
}

/**
 * Convert parsed query filters back to API query params
 */
export function filtersToQueryParams(filters: ParsedSearchQuery["filters"]): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (filters.category) params.category = filters.category;
  if (filters.dealType) params.dealType = filters.dealType;
  if (filters.city) params.city = filters.city;
  if (filters.district) params.district = filters.district;
  if (filters.minPrice) params.minPrice = String(filters.minPrice);
  if (filters.maxPrice) params.maxPrice = String(filters.maxPrice);
  if (filters.minRooms) params.minRooms = String(filters.minRooms);
  if (filters.maxRooms) params.maxRooms = String(filters.maxRooms);
  if (filters.minArea) params.minArea = String(filters.minArea);
  if (filters.maxArea) params.maxArea = String(filters.maxArea);
  
  return params;
}

/**
 * Generate human-readable description of the parsed query
 */
export function describeQuery(parsed: ParsedSearchQuery): string {
  const parts: string[] = [];
  const { filters } = parsed;
  
  if (filters.category) {
    const categoryLabels: Record<string, string> = {
      apartment: "Kvartira",
      house: "Uy",
      villa: "Villa",
      office: "Ofis",
      land: "Yer uchastkasi",
      rent: "Ijara",
    };
    parts.push(categoryLabels[filters.category] || filters.category);
  }
  
  if (filters.minRooms) {
    if (filters.maxRooms && filters.maxRooms !== filters.minRooms) {
      parts.push(`${filters.minRooms}-${filters.maxRooms} xonali`);
    } else {
      parts.push(`${filters.minRooms} xonali`);
    }
  }
  
  if (filters.district) {
    parts.push(filters.district);
  } else if (filters.city) {
    parts.push(filters.city);
  }
  
  if (filters.maxPrice) {
    const formatted = filters.maxPrice >= 1_000_000 
      ? `${(filters.maxPrice / 1_000_000).toFixed(0)} mln`
      : filters.maxPrice >= 1_000
        ? `${(filters.maxPrice / 1_000).toFixed(0)} ming`
        : String(filters.maxPrice);
    parts.push(`${formatted} gacha`);
  }
  
  return parts.length > 0 ? parts.join(", ") : "Barcha e'lonlar";
}
