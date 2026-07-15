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
