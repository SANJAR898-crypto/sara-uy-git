import { db } from "@/db";
import { favorites, properties, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { ADMIN_TELEGRAM_IDS } from "@/lib/constants";
import { getSession } from "@/lib/session";
import type { TelegramUser } from "@/lib/telegram";
import type { CurrentUser, UserRole } from "@/types";

export async function upsertTelegramUser(tgUser: TelegramUser) {
  const role: UserRole = ADMIN_TELEGRAM_IDS.includes(tgUser.id) ? "admin" : "user";

  const existing = await db.select().from(users).where(eq(users.telegramId, tgUser.id)).limit(1);

  if (existing.length > 0) {
    const current = existing[0];
    const [updated] = await db
      .update(users)
      .set({
        username: tgUser.username ?? current.username,
        firstName: tgUser.first_name ?? current.firstName,
        lastName: tgUser.last_name ?? current.lastName,
        avatarUrl: tgUser.photo_url ?? current.avatarUrl,
        languageCode: tgUser.language_code ?? current.languageCode,
        role: current.role === "admin" || role === "admin" ? "admin" : current.role,
      })
      .where(eq(users.id, current.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      telegramId: tgUser.id,
      username: tgUser.username,
      firstName: tgUser.first_name ?? "Foydalanuvchi",
      lastName: tgUser.last_name,
      avatarUrl: tgUser.photo_url,
      languageCode: tgUser.language_code,
      role,
    })
    .returning();
  return created;
}

export async function getCurrentDbUser() {
  const session = await getSession();
  if (!session) return null;
  const rows = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
  return rows[0] ?? null;
}

export async function requireRole(roles: UserRole[]) {
  const user = await getCurrentDbUser();
  if (!user || !roles.includes(user.role as UserRole)) return null;
  return user;
}

export async function toCurrentUser(user: typeof users.$inferSelect): Promise<CurrentUser> {
  const [{ count: listingsCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(properties)
    .where(eq(properties.sellerId, user.id));

  const [{ count: favoritesCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(favorites)
    .where(eq(favorites.userId, user.id));

  const [{ sum: viewsSum }] = await db
    .select({ sum: sql<number>`coalesce(sum(${properties.views}), 0)::int` })
    .from(properties)
    .where(and(eq(properties.sellerId, user.id)));

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Foydalanuvchi";

  return {
    id: String(user.id),
    telegramId: user.telegramId,
    name,
    username: user.username,
    phone: user.phone,
    avatar: user.avatarUrl || `https://i.pravatar.cc/150?u=${user.telegramId}`,
    role: user.role as UserRole,
    verified: user.isVerified,
    isAgency: user.isAgency,
    agencyName: user.agencyName,
    rating: Number(user.rating),
    dealsCount: user.dealsCount,
    memberSince: new Date(user.createdAt).getFullYear().toString(),
    listingsCount,
    favoritesCount,
    viewsCount: viewsSum,
  };
}
