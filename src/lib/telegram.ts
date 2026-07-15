import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface ParsedInitData {
  user: TelegramUser | null;
  authDate: number | null;
}

/**
 * Validates Telegram Mini App `initData` per:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 *
 * When TELEGRAM_BOT_TOKEN is not configured (local/dev/preview), the signature
 * check is skipped and the payload is trusted as-is so the app keeps working
 * outside of Telegram (plain browser preview, health checks, etc).
 */
export function verifyTelegramInitData(initData: string): { valid: boolean; data: ParsedInitData } {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");

  const pairs: string[] = [];
  params.forEach((value, key) => {
    pairs.push(`${key}=${value}`);
  });
  pairs.sort((a, b) => a.localeCompare(b));
  const dataCheckString = pairs.join("\n");

  let valid = false;
  if (botToken && hash) {
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    valid = computedHash === hash;
  }

  const userRaw = params.get("user");
  let user: TelegramUser | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as TelegramUser;
    } catch {
      user = null;
    }
  }

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw ? Number(authDateRaw) : null;

  // Trust the payload in dev mode (no bot token configured) so the mini app
  // remains fully functional in the sandbox / plain-browser preview.
  if (!botToken) {
    valid = Boolean(user);
  }

  return { valid, data: { user, authDate } };
}
