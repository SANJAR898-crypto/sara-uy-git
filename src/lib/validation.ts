/**
 * Shared server-side validation for listing payloads. Used by both the
 * create (`POST /api/properties`) and update (`PATCH /api/properties/:id`)
 * endpoints so business rules stay consistent everywhere.
 */
const VALID_CATEGORIES = ["apartment", "house", "villa", "office", "land", "rent"];
const VALID_DEAL_TYPES = ["sale", "rent"];
const VALID_STATUSES = ["draft", "pending", "active", "paused", "rejected", "archived", "expired", "sold"];
const MAX_IMAGES = 40;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateTitle(title: unknown): ValidationResult {
  if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 140) {
    return { ok: false, error: "Sarlavha 5-140 belgi oralig'ida bo'lishi kerak" };
  }
  return { ok: true };
}

export function validatePrice(price: unknown): ValidationResult {
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0 || num > 100_000_000) {
    return { ok: false, error: "Narx noto'g'ri" };
  }
  return { ok: true };
}

export function validateCategory(category: unknown): ValidationResult {
  if (!VALID_CATEGORIES.includes(String(category))) return { ok: false, error: "Toifa noto'g'ri" };
  return { ok: true };
}

export function validateDealType(dealType: unknown): ValidationResult {
  if (!VALID_DEAL_TYPES.includes(String(dealType))) return { ok: false, error: "Bitim turi noto'g'ri" };
  return { ok: true };
}

export function validateStatus(status: unknown): ValidationResult {
  if (!VALID_STATUSES.includes(String(status))) return { ok: false, error: "Holat noto'g'ri" };
  return { ok: true };
}

export function validateLocation(city: unknown, district: unknown): ValidationResult {
  if (typeof city !== "string" || !city.trim()) return { ok: false, error: "Shahar majburiy" };
  if (typeof district !== "string" || !district.trim()) return { ok: false, error: "Tuman majburiy" };
  return { ok: true };
}

export function validateCoordinates(lat: unknown, lng: unknown): ValidationResult {
  if (lat == null && lng == null) return { ok: true };
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) return { ok: false, error: "Kenglik noto'g'ri" };
  if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) return { ok: false, error: "Uzunlik noto'g'ri" };
  return { ok: true };
}

export function validateImages(images: unknown): ValidationResult {
  if (images == null) return { ok: true };
  if (!Array.isArray(images)) return { ok: false, error: "Rasmlar ro'yxati noto'g'ri" };
  if (images.length > MAX_IMAGES) return { ok: false, error: `Ko'pi bilan ${MAX_IMAGES} ta rasm yuklash mumkin` };
  for (const img of images) {
    if (typeof img !== "string" || img.length === 0) return { ok: false, error: "Rasm manzili noto'g'ri" };
    if (img.length > 6_000_000) return { ok: false, error: "Rasm hajmi juda katta" };
  }
  return { ok: true };
}

export function validateArea(area: unknown): ValidationResult {
  const num = Number(area);
  if (!Number.isFinite(num) || num < 0 || num > 100_000) return { ok: false, error: "Maydon noto'g'ri" };
  return { ok: true };
}

export function validateRooms(rooms: unknown): ValidationResult {
  const num = Number(rooms);
  if (!Number.isFinite(num) || num < 0 || num > 100) return { ok: false, error: "Xonalar soni noto'g'ri" };
  return { ok: true };
}

/** Runs the full set of checks used at listing creation time. */
export function validateListingCreate(body: Record<string, unknown>): ValidationResult {
  const checks = [
    validateTitle(body.title),
    validateCategory(body.category),
    validateDealType(body.dealType),
    validatePrice(body.price),
    validateLocation(body.city, body.district),
    validateCoordinates(body.lat, body.lng),
    validateImages(body.images),
    validateArea(body.area ?? 0),
    validateRooms(body.rooms ?? 1),
  ];
  const failed = checks.find((c) => !c.ok);
  return failed ?? { ok: true };
}
