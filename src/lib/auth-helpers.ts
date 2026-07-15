import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionFromCookies } from "@/lib/session";
import { isAdminTelegramId } from "@/lib/admin";

export type CurrentUser = typeof users.$inferSelect;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  return user ?? null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Kirish talab qilinadi (login required)", 401);
  if (user.isBanned) throw new AuthError("Sizning hisobingiz bloklangan", 403);
  return user;
}

export async function requireSeller(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isSeller) {
    throw new AuthError("Sotuvchi sifatida ro'yxatdan o'ting", 403);
  }
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!isAdminTelegramId(user.telegramId)) {
    throw new AuthError("Admin huquqi talab qilinadi", 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isCurrentUserAdmin(user: CurrentUser | null): boolean {
  return !!user && isAdminTelegramId(user.telegramId);
}
