import type { Category } from "@/types";

export const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan"];
export const DISTRICTS = ["Yunusobod", "Mirzo Ulug'bek", "Chilonzor", "Yakkasaroy", "Shayxontohur", "Sergeli"];

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  apartment: { label: "Kvartira", icon: "building-2" },
  house: { label: "Uy", icon: "home" },
  villa: { label: "Villa", icon: "castle" },
  office: { label: "Ofis", icon: "briefcase" },
  land: { label: "Yer", icon: "map" },
  rent: { label: "Ijara", icon: "key" },
};

export const CATEGORIES: Category[] = (Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((id) => ({
  id: id as Category["id"],
  label: CATEGORY_META[id].label,
  icon: CATEGORY_META[id].icon,
}));

export const ADMIN_TELEGRAM_IDS = (process.env.ADMIN_TELEGRAM_IDS ?? "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean)
  .map(Number);

/* ============================================================
   SELLER PLATFORM — property detail option lists
   ============================================================ */
export const HEATING_OPTIONS = [
  { id: "central", label: "Markazlashgan" },
  { id: "autonomous", label: "Avtonom" },
  { id: "electric", label: "Elektr" },
  { id: "none", label: "Yo'q" },
];

export const FURNITURE_OPTIONS = [
  { id: "full", label: "To'liq jihozlangan" },
  { id: "partial", label: "Qisman jihozlangan" },
  { id: "none", label: "Jihozlanmagan" },
];

export const REPAIR_OPTIONS = [
  { id: "euro", label: "Yevro remont" },
  { id: "good", label: "Yaxshi holatda" },
  { id: "needs_repair", label: "Ta'mir talab qiladi" },
  { id: "rough", label: "Qora suvoq" },
];

export const RENT_PERIOD_OPTIONS = [
  { id: "daily", label: "Kunlik" },
  { id: "monthly", label: "Oylik" },
  { id: "yearly", label: "Yillik" },
];

export const AMENITIES_META: Record<string, { label: string; icon: string }> = {
  parking: { label: "Avtoturargoh", icon: "car" },
  balcony: { label: "Balkon", icon: "layout-panel-top" },
  garden: { label: "Bog'", icon: "trees" },
  pool: { label: "Basseyn", icon: "waves" },
  security: { label: "Xavfsizlik", icon: "shield" },
  internet: { label: "Internet", icon: "wifi" },
  ac: { label: "Konditsioner", icon: "wind" },
};

export const PROPERTY_STATUS_META: Record<
  string,
  { label: string; variant: "default" | "vip" | "verified" | "new" | "rent" | "danger" }
> = {
  draft: { label: "Qoralama", variant: "default" },
  pending: { label: "Kutilmoqda", variant: "default" },
  active: { label: "Faol", variant: "verified" },
  paused: { label: "To'xtatilgan", variant: "rent" },
  rejected: { label: "Rad etildi", variant: "danger" },
  archived: { label: "Arxivlangan", variant: "default" },
  expired: { label: "Muddati tugagan", variant: "danger" },
  sold: { label: "Sotilgan", variant: "new" },
};

export const PREFERRED_CONTACT_TIMES = [
  { id: "anytime", label: "Har doim" },
  { id: "morning", label: "Ertalab (9:00-12:00)" },
  { id: "afternoon", label: "Kunduzi (12:00-18:00)" },
  { id: "evening", label: "Kechqurun (18:00-22:00)" },
];
