/**
 * Admin access is granted EXCLUSIVELY through a numeric Telegram user ID
 * allowlist configured via the ADMIN_TELEGRAM_IDS environment variable.
 * There is no username, phone number, or client-side role that can grant
 * admin access — this is enforced server-side on every request.
 */
export function getAdminTelegramIds(): string[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminTelegramId(telegramId: string | null | undefined): boolean {
  if (!telegramId) return false;
  const ids = getAdminTelegramIds();
  if (ids.length === 0) return false;
  return ids.includes(telegramId);
}
