export type PropertyCategory =
  | "apartment"
  | "house"
  | "office"
  | "land"
  | "villa"
  | "rent";

export type DealType = "sale" | "rent";

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  isAgency: boolean;
  rating: number;
  dealsCount: number;
  phone: string;
  memberSince: string;
}

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  dealType: DealType;
  price: number;
  currency: "USD" | "UZS";
  city: string;
  district: string;
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  images: string[];
  isVip: boolean;
  isVerified: boolean;
  isNew: boolean;
  createdAt: string;
  description: string;
  seller: Seller;
  views: number;
}

export interface Story {
  id: string;
  name: string;
  avatar: string;
  image: string;
  isVip: boolean;
  seen: boolean;
}

export interface Category {
  id: PropertyCategory;
  label: string;
  icon: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "price" | "message" | "system" | "vip";
}
