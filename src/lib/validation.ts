import { z } from "zod";

export const listingCreateSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  dealType: z.enum(["sale", "rent", "daily_rent", "monthly_rent"]),
  propertyType: z.enum([
    "apartment",
    "house",
    "villa",
    "cottage",
    "commercial",
    "office",
    "land",
    "warehouse",
    "new_building",
  ]),
  regionId: z.string().min(1),
  districtId: z.string().min(1),
  address: z.string().min(3).max(300),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  price: z.number().positive(),
  currency: z.enum(["UZS", "USD"]).default("UZS"),
  isNegotiable: z.boolean().default(false),
  area: z.number().positive(),
  rooms: z.number().int().min(0).max(50),
  floor: z.number().int().optional().nullable(),
  maxFloors: z.number().int().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1).max(20),
  videoUrl: z.string().url().optional().nullable(),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const inquiryCreateSchema = z.object({
  listingId: z.number().int().positive(),
  contactType: z.enum(["call", "telegram", "share"]),
  message: z.string().max(1000).optional(),
});

export const reviewCreateSchema = z.object({
  sellerId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).default(""),
});

export const reportCreateSchema = z.object({
  listingId: z.number().int().positive(),
  reason: z.enum(["fake", "spam", "wrong_price", "duplicate", "sold", "incorrect_info"]),
  description: z.string().max(1000).optional(),
});

export const sellerApplySchema = z.object({
  phoneNumber: z.string().min(9).max(20),
  agencyName: z.string().max(128).optional(),
  bio: z.string().max(1000).optional(),
});

export const savedSearchSchema = z.object({
  name: z.string().min(1).max(128),
  query: z.string().max(300).optional(),
  filters: z.record(z.string(), z.unknown()),
});
