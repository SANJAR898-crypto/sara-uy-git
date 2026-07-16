import { timeAgo } from "@/lib/format";
import type { AppNotification, Property, PropertyCategory, Seller, Story } from "@/types";
import type { NotificationRow, PropertyRow, StoryRow, UserRow } from "@/db/schema";

export function mapSeller(user: UserRow): Seller {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Foydalanuvchi";
  return {
    id: String(user.id),
    name,
    username: user.username,
    avatar: user.avatarUrl || `https://i.pravatar.cc/150?u=${user.telegramId}`,
    verified: user.isVerified,
    isAgency: user.isAgency,
    agencyName: user.agencyName,
    rating: Number(user.rating),
    dealsCount: user.dealsCount,
    phone: user.phone,
    memberSince: new Date(user.createdAt).getFullYear().toString(),
    bio: user.bio,
    languages: user.languages ?? [],
    workingHours: user.workingHours,
    responseTimeMinutes: user.responseTimeMinutes,
    responseRate: user.responseRate,
  };
}

export function mapProperty(row: PropertyRow, seller: UserRow): Property {
  return {
    id: String(row.id),
    title: row.title,
    category: row.category as PropertyCategory,
    dealType: row.dealType as Property["dealType"],
    price: Number(row.price),
    currency: row.currency as Property["currency"],
    city: row.city,
    district: row.district,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    nearbyPlaces: row.nearbyPlaces ?? [],
    rooms: row.rooms,
    area: row.area,
    floor: row.floor,
    totalFloors: row.totalFloors,
    bathrooms: row.bathrooms,
    kitchenArea: row.kitchenArea,
    yearBuilt: row.yearBuilt,
    heating: row.heating,
    furniture: row.furniture,
    repairStatus: row.repairStatus,
    amenities: row.amenities ?? {},
    negotiable: row.negotiable,
    installment: row.installment,
    mortgage: row.mortgage,
    rentPeriod: row.rentPeriod,
    serviceFee: row.serviceFee != null ? Number(row.serviceFee) : null,
    contactPhone: row.contactPhone,
    contactTelegram: row.contactTelegram,
    hidePhone: row.hidePhone,
    preferredContactTime: row.preferredContactTime,
    images: row.images ?? [],
    isVip: row.isVip,
    isPremium: row.isPremium,
    isVerified: row.isVerified,
    isNew: row.isNew,
    status: row.status as Property["status"],
    rejectionReason: row.rejectionReason,
    createdAt: timeAgo(row.createdAt),
    description: row.description,
    seller: mapSeller(seller),
    views: row.views,
    favoritesCount: row.favoritesCount,
    telegramContacts: row.telegramContacts,
    phoneCalls: row.phoneCalls,
    messagesCount: row.messagesCount,
    expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : null,
    vipExpiresAt: row.vipExpiresAt ? new Date(row.vipExpiresAt).toISOString() : null,
    premiumExpiresAt: row.premiumExpiresAt ? new Date(row.premiumExpiresAt).toISOString() : null,
    soldAt: row.soldAt ? new Date(row.soldAt).toISOString() : null,
  };
}

export function mapStory(row: StoryRow, seen: boolean): Story {
  return {
    id: String(row.id),
    name: row.name,
    avatar: row.avatarUrl,
    image: row.imageUrl,
    isVip: row.isVip,
    seen,
  };
}

export function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: String(row.id),
    title: row.title,
    message: row.message,
    time: timeAgo(row.createdAt),
    read: row.read,
    type: row.type,
  };
}
