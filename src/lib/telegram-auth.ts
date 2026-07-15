import { createHash, createHmac } from "crypto";

export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface VerifiedTelegramData {
  user: TelegramWebAppUser;
  authDate: number;
}

/**
 * Verifies the `initData` string produced by the Telegram Mini App client
 * using the official HMAC-SHA256 algorithm described at
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
): VerifiedTelegramData | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;
    params.delete("hash");

    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join("\n");

    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (computedHash !== hash) return null;

    const authDate = Number(params.get("auth_date") ?? 0);
    // Reject stale init data older than 24 hours
    if (!authDate || Date.now() / 1000 - authDate > 86400) return null;

    const userRaw = params.get("user");
    if (!userRaw) return null;
    const user = JSON.parse(userRaw) as TelegramWebAppUser;
    if (!user?.id) return null;

    return { user, authDate };
  } catch {
    return null;
  }
}

/** Simple non-cryptographic fallback used only when no bot token is configured (local preview). */
export function unsafeDecodeInitData(initData: string): VerifiedTelegramData | null {
  try {
    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");
    if (!userRaw) return null;
    const user = JSON.parse(userRaw) as TelegramWebAppUser;
    if (!user?.id) return null;
    return { user, authDate: Number(params.get("auth_date") ?? Date.now() / 1000) };
  } catch {
    return null;
  }
}

export function anonymousViewerKey(seed: string): string {
  return createHash("sha256").update(seed).digest("hex").slice(0, 32);
}
