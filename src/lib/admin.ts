import { NextRequest } from "next/server";
import { db } from "@/db";
import { auditLogs, featureFlags, systemSettings, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";
import type { UserRow } from "@/db/schema";

/* ============================================================
   ADMIN GUARD
   Backend-only authorization. Telegram ID / role is never trusted
   from the frontend — every check re-reads the session-bound user
   from the database on each request.
   ============================================================ */
export async function requireAdmin(): Promise<UserRow | null> {
  const user = await getCurrentDbUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/* ============================================================
   AUDIT TRAIL
   ============================================================ */
export async function logAudit(params: {
  actor: UserRow | null;
  action: string;
  targetType?: string;
  targetId?: string | number;
  metadata?: Record<string, unknown>;
  req?: NextRequest;
}) {
  const { actor, action, targetType, targetId, metadata, req } = params;
  const ip =
    req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req?.headers.get("x-real-ip") ||
    null;

  await db.insert(auditLogs).values({
    actorId: actor?.id ?? null,
    actorTelegramId: actor?.telegramId ?? null,
    actorName: actor ? [actor.firstName, actor.lastName].filter(Boolean).join(" ") || actor.username || null : null,
    action,
    targetType: targetType ?? null,
    targetId: targetId != null ? String(targetId) : null,
    metadata: metadata ?? {},
    ip,
  });
}

export async function listAuditLogs(limit = 100) {
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

/* ============================================================
   SYSTEM SETTINGS  (key/value store)
   ============================================================ */
export const DEFAULT_SETTINGS: Record<string, unknown> = {
  maintenance_mode: { enabled: false, message: "Sara Uylar texnik ishlar tufayli vaqtincha mavjud emas." },
  support_contact: { telegram: "@sarauylar_support", phone: "+998901234567" },
  commission_rate: { percent: 3 },
};

export async function ensureSettingsSeeded() {
  const existing = await db.select({ key: systemSettings.key }).from(systemSettings).limit(1);
  if (existing.length > 0) return;
  await db.insert(systemSettings).values(
    Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value }))
  );
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  await ensureSettingsSeeded();
  const rows = await db.select().from(systemSettings);
  const map: Record<string, unknown> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const rows = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  if (rows.length > 0) return rows[0].value as T;
  return (DEFAULT_SETTINGS[key] as T) ?? null;
}

export async function setSetting(key: string, value: unknown, updatedBy?: number | null) {
  const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  if (existing.length > 0) {
    const [updated] = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date(), updatedBy: updatedBy ?? null })
      .where(eq(systemSettings.key, key))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(systemSettings)
    .values({ key, value, updatedBy: updatedBy ?? null })
    .returning();
  return created;
}

export async function isMaintenanceModeEnabled(): Promise<{ enabled: boolean; message: string }> {
  try {
    const value = await getSetting<{ enabled?: boolean; message?: string }>("maintenance_mode");
    return {
      enabled: Boolean(value?.enabled),
      message: value?.message || "Sara Uylar texnik ishlar tufayli vaqtincha mavjud emas.",
    };
  } catch {
    // If the settings table doesn't exist yet (fresh DB before push) never block the app.
    return { enabled: false, message: "" };
  }
}

/* ============================================================
   FEATURE FLAGS
   ============================================================ */
export const DEFAULT_FLAGS: { key: string; label: string; description: string; enabled: boolean }[] = [
  { key: "ai_assist", label: "AI yordamchi", description: "E'lon yaratishda AI yordamchi funksiyasi", enabled: true },
  { key: "ai_price_advice", label: "AI narx maslahati", description: "AI orqali narx tavsiyalari", enabled: true },
  { key: "stories", label: "Stories", description: "Bosh sahifadagi stories bloki", enabled: true },
  { key: "seller_platform", label: "Sotuvchi platformasi", description: "Sotuvchilar uchun to'liq platforma", enabled: true },
  { key: "guest_mode", label: "Mehmon rejimi", description: "Telegramsiz mehmon sifatida kirish", enabled: true },
];

export async function ensureFlagsSeeded() {
  const existing = await db.select({ key: featureFlags.key }).from(featureFlags).limit(1);
  if (existing.length > 0) return;
  await db.insert(featureFlags).values(DEFAULT_FLAGS.map((f) => ({ ...f })));
}

export async function getAllFlags() {
  await ensureFlagsSeeded();
  return db.select().from(featureFlags).orderBy(featureFlags.key);
}

export async function isFlagEnabled(key: string): Promise<boolean> {
  try {
    const rows = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
    if (rows.length > 0) return rows[0].enabled;
    return DEFAULT_FLAGS.find((f) => f.key === key)?.enabled ?? false;
  } catch {
    return DEFAULT_FLAGS.find((f) => f.key === key)?.enabled ?? false;
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
export async function findUserById(id: number) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}
