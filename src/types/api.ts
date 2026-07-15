export interface ListingOwner {
  id?: number;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  rating: string | null;
  phone?: string | null;
  agencyName?: string | null;
  sellerSince?: string | null;
}

export interface ListingItem {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  dealType: string;
  propertyType: string;
  regionId: string | null;
  districtId: string | null;
  address: string;
  lat: string | null;
  lng: string | null;
  price: string;
  currency: string;
  isNegotiable: boolean;
  area: string;
  rooms: number;
  floor: number | null;
  maxFloors: number | null;
  amenities: string[];
  plan: string;
  planExpiresAt: string | null;
  status: string;
  rejectionReason: string | null;
  viewsCount: number;
  favoritesCount: number;
  sharesCount: number;
  callsCount: number;
  telegramClicksCount: number;
  reportsCount: number;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[];
  owner?: ListingOwner;
}

export interface District {
  id: string;
  regionId: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
}

export interface Region {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  sortOrder: number;
  districts: District[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  badge: string;
  benefits: string[];
  sortOrder: number;
}

export interface StorySlide {
  id: number;
  storyId: number;
  imageUrl: string;
  title: string;
  description: string | null;
  linkText: string | null;
  linkUrl: string | null;
  sortOrder: number;
  durationMs: number;
}

export interface StoryItem {
  id: number;
  title: string;
  coverUrl: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  viewsCount: number;
  createdAt: string;
  slides: StorySlide[];
}
