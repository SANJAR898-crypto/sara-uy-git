/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  telegramId: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  isRegistered: boolean;
  isVerifiedSeller?: boolean;
  phone_verified?: boolean;
  packageId?: SubscriptionTier;
  packageExpiresAt?: string;
  listingsCreatedCount?: number;
  joinedDate?: string;
  firstName?: string;
  lastName?: string;
  isTelegramPremium?: boolean;
  languageCode?: string;
}

export type PropertyType = 
  | 'apartment' 
  | 'house' 
  | 'villa' 
  | 'cottage' 
  | 'commercial' 
  | 'office' 
  | 'land' 
  | 'warehouse' 
  | 'new_building';

export type DealType = 'sale' | 'rent' | 'daily_rent' | 'monthly_rent';

export type SubscriptionTier = 'vip' | 'premium' | 'standard' | 'story' | 'basic' | 'agency' | 'broker';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  durationDays: number;
  badge: string;
  benefits?: string[];
  visibility?: string;
  priority?: string;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  packageId: SubscriptionTier;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'click' | 'payme' | 'uzum' | 'manual';
  createdAt: string;
  rejectionReason?: string;
  listingId?: string;
  transactionId?: string;
}

export interface SubscriptionHistoryItem {
  id: string;
  listingId: string;
  listingTitle: string;
  planId: SubscriptionTier;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
  pricePaid: number;
}

export interface Listing {
  id: string;
  ownerName: string;
  ownerPhone: string;
  ownerTelegram: string;
  ownerWhatsapp?: string;
  title: string;
  dealType: DealType;
  propertyType: PropertyType;
  regionId: string;
  districtId: string;
  address: string;
  googleMapUrl: string;
  price: number; // Sale price (total) or rental price (per month)
  currency?: 'UZS' | 'USD';
  isNegotiable?: boolean;
  isVIP?: boolean;
  isFeatured?: boolean;
  isUrgent?: boolean;
  area: number; // in square meters (m²)
  rooms: number;
  floor?: number; // for apartments
  maxFloors?: number; // total floors of building
  description: string;
  isPremium: boolean; // keep for backward compatibility
  plan?: SubscriptionTier; // 'vip' | 'premium' | 'standard'
  planExpiresAt?: string; // ISO date string
  viewsCount: number;
  favoritesCount?: number;
  sharesCount?: number;
  reportsCount: number;
  
  // Property Amenities & Utilities
  hasGas: boolean;
  hasElectricity: boolean;
  hasWater: boolean;
  hasSewage: boolean;
  hasInternet: boolean;
  hasParking: boolean;
  hasFurniture: boolean;
  hasSecurity: boolean;
  
  // Media
  imageUrls: string[];
  videoUrl?: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  rating: number; // Agency score / rating
}

// Replaces Bookings: contact request lead from clients
export interface Inquiry {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userPhone: string;
  contactType: 'call' | 'telegram' | 'whatsapp';
  message: string;
  createdAt: string;
  status: 'new' | 'processed' | 'archived';
}

export interface Review {
  id: string;
  listingId?: string; // listing context
  sellerId?: string; // references User.id or User.telegramId
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string; // references User.id
  title: string;
  message: string;
  type: 'inquiry' | 'system' | 'broadcast' | 'listing' | 'report' | 'vip_expired' | 'subscription_expired' | 'admin_message';
  isRead: boolean;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  nameUz?: string;
  nameUzCyrl?: string;
  nameRu?: string;
  nameEn?: string;
}

export interface District {
  id: string;
  regionId: string;
  name: string;
  nameUz?: string;
  nameUzCyrl?: string;
  nameRu?: string;
  nameEn?: string;
}

export interface BotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  buttons?: { text: string; action: string }[];
  miniAppUrl?: string;
}

// --- NEW SCALABLE NORMALIZED ENTITIES ---

export interface GuestUser {
  id: string; // guest-uuid or Telegram temporary ID
  lastActive: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SellerProfile {
  id: string;
  userId: string; // references User.id or User.telegramId
  bio?: string;
  rating: number;
  joinedDate: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  activeListingsCount: number;
  soldListingsCount: number;
  responseTime: string; // e.g., "15 daqiqa"
  agencyName?: string;
  agencyLogo?: string;
  isPremium: boolean;
  isVIP: boolean;
}

export interface AdminProfile {
  id: string;
  userId: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'moderator';
  permissions: string[];
  lastLogin?: string;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  order: number;
  isThumbnail: boolean;
  width?: number;
  height?: number;
  size?: number;
  compressedUrl?: string;
}

export interface ListingVideo {
  id: string;
  listingId: string;
  url: string;
  provider: 'local' | 'telegram' | 'youtube' | 'vimeo';
  duration?: number;
}

export interface StorySlide {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  coverUrl: string;
  category: 'news' | 'offers' | 'developers' | 'agents';
  slides: StorySlide[];
  duration?: number; // per slide duration in ms
  isFeatured: boolean;
  createdAt: string;
  viewsCount?: number;
}

export interface StoryView {
  id: string;
  storyId: string;
  userId?: string;
  guestId?: string;
  viewedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  userId?: string;
  guestId?: string;
  query: string;
  filters?: string; // JSON string of applied filters
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: SubscriptionTier;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  pricePaid: number;
  transactionId?: string;
}

export interface Report {
  id: string;
  reporterId: string; // userId or guestId
  listingId: string;
  reason: 'fake' | 'spam' | 'wrong_price' | 'duplicate' | 'sold' | 'incorrect_info';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

export interface Analytics {
  id: string;
  eventType: 'view' | 'favorite' | 'call' | 'telegram_click' | 'share' | 'search' | 'active_user';
  userId?: string;
  guestId?: string;
  listingId?: string;
  metadata?: string; // JSON string for arbitrary stats
  createdAt: string;
}

export interface PropertyTypeEntity {
  id: string;
  code: PropertyType;
  nameUz: string;
  nameUzCyrl: string;
  nameRu: string;
  nameEn: string;
  icon?: string;
}

export interface Amenity {
  id: string;
  code: string;
  nameUz: string;
  nameUzCyrl: string;
  nameRu: string;
  nameEn: string;
  icon?: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  sellerProfileId: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl?: string;
  selfieUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface PhoneVerification {
  id: string;
  phoneNumber: string;
  code: string;
  isVerified: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  guestId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminUserId: string;
  action: string;
  entityName: string;
  entityId: string;
  previousState?: string; // JSON string
  newState?: string; // JSON string
  createdAt: string;
}
