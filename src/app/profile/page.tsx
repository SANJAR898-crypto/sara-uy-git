"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, ChevronRight, LayoutDashboard, LogOut, Shield, Star, User as UserIcon } from "lucide-react";
import { useTelegram } from "@/contexts/TelegramProvider";
import { LogoMark } from "@/components/ui/Logo";
import { apiFetch } from "@/lib/api-client";

export default function ProfilePage() {
  const { user, isAdmin, tgUser, isLoadingUser, refreshUser } = useTelegram();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
  }

  return (
    <div className="min-h-screen">
      <header className="safe-top sticky top-0 z-40 glass px-4 py-4">
        <h1 className="text-lg font-extrabold text-ink-900">Profil</h1>
      </header>

      <main className="space-y-4 px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03]"
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-brand-100">
            {user?.avatarUrl || tgUser?.photo_url ? (
              <Image src={user?.avatarUrl || tgUser!.photo_url!} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-brand-500">
                <UserIcon size={26} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-ink-900">
              {isLoadingUser ? "Yuklanmoqda..." : user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Foydalanuvchi" : "Mehmon"}
            </p>
            <p className="text-xs text-ink-400">{user?.username ? `@${user.username}` : tgUser?.username ? `@${tgUser.username}` : "Telegram orqali kirilmagan"}</p>
            {user?.isSeller && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                <BadgeCheck size={12} /> Tasdiqlangan sotuvchi
              </span>
            )}
          </div>
        </motion.div>

        {!user?.isSeller && (
          <Link
            href="/seller/apply"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 p-4 text-white shadow-lg shadow-brand-500/25"
          >
            <div>
              <p className="font-extrabold">Sotuvchi bo&apos;ling</p>
              <p className="text-xs text-white/80">E&apos;lon joylashtirish uchun ro&apos;yxatdan o&apos;ting</p>
            </div>
            <ChevronRight size={20} />
          </Link>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/[0.03]">
          {user?.isSeller && (
            <ProfileLink href="/seller" icon={<LayoutDashboard size={18} />} label="Sotuvchi paneli" />
          )}
          <ProfileLink href="/favorites" icon={<Star size={18} />} label="Sevimlilarim" />
          {isAdmin && <ProfileLink href="/admin" icon={<Shield size={18} />} label="Admin panel" highlight />}
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 py-3.5 text-sm font-bold text-ink-500"
          >
            <LogOut size={16} /> Chiqish
          </button>
        )}

        <div className="flex flex-col items-center gap-2 pt-6 opacity-60">
          <LogoMark size={32} />
          <p className="text-[11px] text-ink-400">Sara Uylar © {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}

function ProfileLink({
  href,
  icon,
  label,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-ink-100 px-4 py-3.5 last:border-0"
    >
      <div className="flex items-center gap-3">
        <span className={highlight ? "text-gold-500" : "text-brand-500"}>{icon}</span>
        <span className="text-sm font-semibold text-ink-800">{label}</span>
      </div>
      <ChevronRight size={16} className="text-ink-300" />
    </Link>
  );
}
