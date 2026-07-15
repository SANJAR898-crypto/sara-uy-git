import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyTelegramInitData, unsafeDecodeInitData } from "@/lib/telegram-auth";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!rateLimit(getClientKey(req, "auth"), 20, 60_000)) {
      return jsonError("Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring.", 429);
    }

    const body = await req.json().catch(() => null);
    const initData: string | undefined = body?.initData;
    if (!initData) return jsonError("initData talab qilinadi", 400);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    let verified = botToken ? verifyTelegramInitData(initData, botToken) : null;

    if (!verified) {
      if (botToken) {
        return jsonError("Telegram autentifikatsiyasi muvaffaqiyatsiz", 403);
      }
      // No bot token configured (local/dev preview): decode without signature
      // verification so the app remains usable while still reading real
      // Telegram-provided user fields when available.
      verified = unsafeDecodeInitData(initData);
      if (!verified) return jsonError("initData noto'g'ri formatda", 400);
    }

    const tgUser = verified.user;
    const telegramId = String(tgUser.id);

    const [existing] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);

    let user;
    if (existing) {
      [user] = await db
        .update(users)
        .set({
          username: tgUser.username ?? existing.username,
          firstName: tgUser.first_name ?? existing.firstName,
          lastName: tgUser.last_name ?? existing.lastName,
          avatarUrl: tgUser.photo_url ?? existing.avatarUrl,
          languageCode: tgUser.language_code ?? existing.languageCode,
          isTelegramPremium: !!tgUser.is_premium,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
    } else {
      [user] = await db
        .insert(users)
        .values({
          telegramId,
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          avatarUrl: tgUser.photo_url,
          languageCode: tgUser.language_code ?? "uz",
          isTelegramPremium: !!tgUser.is_premium,
        })
        .returning();
    }

    if (user.isBanned) {
      return jsonError("Sizning hisobingiz bloklangan", 403);
    }

    const token = await createSessionToken({ userId: user.id, telegramId: user.telegramId });
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
