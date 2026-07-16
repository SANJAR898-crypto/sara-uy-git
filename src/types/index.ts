export type PropertyCategory = "apartment" | "house" | "office" | "land" | "villa" | "rent";
export type DealType = "sale" | "rent";
export type PropertyStatus = "pending" | "active" | "rejected" | "archived";
export type UserRole = "user" | "seller" | "admin";

export interface Seller {
  id: string;
  name: string;
  username: string | null;
  avatar: string;
  verified: boolean;
  isAgency: boolean;
  rating: number;
  dealsCount: number;
  phone: string | null;
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
  address: string | null;
  lat: number | null;
  lng: number | null;
  rooms: number;
  area: number;
  floor?: number | null;
  totalFloors?: number | null;
  images: string[];
  isVip: boolean;
  isVerified: boolean;
  isNew: boolean;
  status: PropertyStatus;
  rejectionReason?: string | null;
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

export interface CurrentUser {
  id: string;
  telegramId: number;
  name: string;
  username: string | null;
  phone: string | null;
  avatar: string;
  role: UserRole;
  verified: boolean;
  isAgency: boolean;
  agencyName: string | null;
  rating: number;
  dealsCount: number;
  memberSince: string;
  listingsCount: number;
  favoritesCount: number;
  viewsCount: number;
}
