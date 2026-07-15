import { NextRequest, NextResponse } from "next/server";
import { toCurrentUser, upsertTelegramUser } from "@/lib/auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { verifyTelegramInitData, type TelegramUser } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// Deterministic "guest" identity used when the app is opened outside of
// Telegram (plain browser preview, health checks, local dev, etc.) so every
// feature keeps working end-to-end without a real Telegram session.
const GUEST_USER: TelegramUser = {
  id: 10_000_001,
  first_name: "Mehmon",
  last_name: "Foydalanuvchi",
  username: "guest",
  language_code: "uz",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const initData: string = typeof body?.initData === "string" ? body.initData : "";

  let telegramUser: TelegramUser | null = null;

  if (initData) {
    const { valid, data } = verifyTelegramInitData(initData);
    if (valid && data.user) {
      telegramUser = data.user;
    }
  }

  if (!telegramUser) {
    telegramUser = GUEST_USER;
  }

  const dbUser = await upsertTelegramUser(telegramUser);
  const token = await createSessionToken({ uid: dbUser.id, telegramId: dbUser.telegramId, role: dbUser.role });
  await setSessionCookie(token);

  const currentUser = await toCurrentUser(dbUser);
  return NextResponse.json({ user: currentUser });
}
