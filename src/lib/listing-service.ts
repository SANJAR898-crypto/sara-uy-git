import { db } from "@/db";
import { notifications, properties } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getPlanByKey, getSellerSubscriptionRow, reconcileExpiredSubscription } from "@/lib/subscription";
import { mapProperty } from "@/lib/mappers";
import type { PropertyRow, UserRow } from "@/db/schema";

export type ListingAction =
  | "archive"
  | "pause"
  | "activate"
  | "renew"
  | "mark_sold"
  | "promote_vip"
  | "promote_premium"
  | "unpromote_vip"
  | "unpromote_premium"
  | "submit_for_review";

const VIP_DURATION_DAYS = 14;
const PREMIUM_DURATION_DAYS = 14;
const LISTING_EXPIRY_DAYS = 60;

export class ListingLimitError extends Error {}

/** Ensures a seller hasn't exceeded their subscription plan's listing quotas. */
export async function assertWithinListingLimits(sellerId: number, kind: "listing" | "vip" | "premium" = "listing") {
  await reconcileExpiredSubscription(sellerId);
  const sub = await getSellerSubscriptionRow(sellerId);
  const plan = await getPlanByKey(sub.planKey);

  const activeStatuses = ["draft", "pending", "active", "paused"] as const;

  if (kind === "listing") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(and(eq(properties.sellerId, sellerId), sql`${properties.status} = any(${activeStatuses})`));
    if (count >= plan.maxListings) {
      throw new ListingLimitError(
        `"${plan.name}" tarifida maksimal ${plan.maxListings} ta e'lon joylashtirish mumkin. Tarifni yangilang.`
      );
    }
  }

  if (kind === "vip") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(and(eq(properties.sellerId, sellerId), eq(properties.isVip, true)));
    if (count >= plan.maxVipListings) {
      throw new ListingLimitError(
        `"${plan.name}" tarifida maksimal ${plan.maxVipListings} ta VIP e'lon mumkin. Tarifni yangilang.`
      );
    }
  }

  if (kind === "premium") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(and(eq(properties.sellerId, sellerId), eq(properties.isPremium, true)));
    if (count >= plan.maxPremiumListings) {
      throw new ListingLimitError(
        `"${plan.name}" tarifida maksimal ${plan.maxPremiumListings} ta Premium e'lon mumkin. Tarifni yangilang.`
      );
    }
  }

  return plan;
}

async function notify(userId: number, title: string, message: string, type: string) {
  await db.insert(notifications).values({ userId, title, message, type });
}

export async function performListingAction(
  property: PropertyRow,
  seller: UserRow,
  action: ListingAction
): Promise<PropertyRow> {
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  switch (action) {
    case "archive":
      patch.status = "archived";
      break;
    case "pause":
      if (property.status !== "active") throw new Error("Faqat faol e'lonlarni to'xtatish mumkin");
      patch.status = "paused";
      break;
    case "activate":
      if (!["paused", "archived", "expired"].includes(property.status)) {
        throw new Error("Bu e'lonni faollashtirib bo'lmaydi");
      }
      patch.status = "active";
      patch.expiresAt = new Date(Date.now() + LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      break;
    case "renew":
      patch.expiresAt = new Date(Date.now() + LISTING_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      if (property.status === "expired") patch.status = "active";
      break;
    case "mark_sold":
      patch.status = "sold";
      patch.soldAt = new Date();
      break;
    case "submit_for_review":
      if (property.status !== "draft") throw new Error("Faqat qoralamalarni yuborish mumkin");
      patch.status = "pending";
      break;
    case "promote_vip": {
      await assertWithinListingLimits(seller.id, "vip");
      patch.isVip = true;
      patch.vipExpiresAt = new Date(Date.now() + VIP_DURATION_DAYS * 24 * 60 * 60 * 1000);
      break;
    }
    case "unpromote_vip":
      patch.isVip = false;
      patch.vipExpiresAt = null;
      break;
    case "promote_premium": {
      await assertWithinListingLimits(seller.id, "premium");
      patch.isPremium = true;
      patch.premiumExpiresAt = new Date(Date.now() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000);
      break;
    }
    case "unpromote_premium":
      patch.isPremium = false;
      patch.premiumExpiresAt = null;
      break;
    default:
      throw new Error("Noma'lum amal");
  }

  const [updated] = await db.update(properties).set(patch).where(eq(properties.id, property.id)).returning();

  if (action === "promote_vip") {
    await notify(seller.id, "VIP maqomi berildi ⭐", `"${updated.title}" e'loningiz endi VIP sifatida ko'rsatiladi.`, "vip");
  }
  if (action === "promote_premium") {
    await notify(
      seller.id,
      "Premium maqomi berildi 💎",
      `"${updated.title}" e'loningiz endi Premium sifatida ko'rsatiladi.`,
      "premium"
    );
  }
  if (action === "mark_sold") {
    await notify(seller.id, "E'lon sotilgan deb belgilandi", `"${updated.title}" tabriklaymiz!`, "system");
  }

  return updated;
}

export async function duplicateListing(property: PropertyRow): Promise<PropertyRow> {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = property;
  const [created] = await db
    .insert(properties)
    .values({
      ...rest,
      title: `${property.title} (nusxa)`,
      status: "draft",
      views: 0,
      favoritesCount: 0,
      telegramContacts: 0,
      phoneCalls: 0,
      messagesCount: 0,
      isVip: false,
      isPremium: false,
      vipExpiresAt: null,
      premiumExpiresAt: null,
      soldAt: null,
      rejectionReason: null,
    })
    .returning();
  return created;
}

export function toPropertyDTO(row: PropertyRow, seller: UserRow) {
  return mapProperty(row, seller);
}
