"use client";

import { motion } from "framer-motion";
import {
  Award,
  Bell,
  ChevronRight,
  Eye,
  Heart,
  LayoutList,
  LogOut,
  Settings,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSession, useToast } from "@/components/providers";
import { Button, Loader } from "@/components/ui";

export default function ProfilePage() {
  const { user, loading, refresh, logout } = useSession();
  const { showToast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const becomeSeller = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "seller" }),
      });
      if (res.ok) {
        await refresh();
        showToast("Endi siz sotuvchisiz!", "success");
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <Loader className="pt-20" />;

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-[15px] font-semibold text-ink-900">Tizimga kirilmagan</p>
        <p className="text-[13.5px] text-ink-700/60">Iltimos, ilovani qayta yuklang.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 pt-6">
      <div className="px-4">
        <div className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-gradient-to-br from-[#08233a] via-[#0b5c94] to-brand-500 p-5 text-white shadow-[var(--shadow-lift)]">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-white/40" />
            {user.verified && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <Award className="h-3 w-3 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold">{user.name}</p>
            <p className="text-[12.5px] text-white/60">
              {user.username ? `@${user.username}` : "Telegram foydalanuvchisi"} • {user.memberSince} yildan buyon
            </p>
            <div className="mt-1 flex items-center gap-1 text-[12.5px] font-semibold text-vip">
              ⭐ {user.rating.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4">
        <StatBlock icon={<LayoutList className="h-4.5 w-4.5" />} label="E'lonlar" value={user.listingsCount} />
        <StatBlock icon={<Heart className="h-4.5 w-4.5" />} label="Sevimli" value={user.favoritesCount} />
        <StatBlock icon={<Eye className="h-4.5 w-4.5" />} label="Ko'rishlar" value={user.viewsCount} />
      </div>

      {user.role === "user" && (
        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[var(--radius-lg)] border border-border bg-white p-4"
          >
            <p className="text-[14px] font-bold text-ink-900">Sotuvchi bo&apos;ling</p>
            <p className="mt-1 text-[13px] text-ink-700/60">
              E&apos;lon joylashtirish va mijozlar bilan bog&apos;lanish uchun sotuvchi profiliga o&apos;ting.
            </p>
            <Button size="sm" className="mt-3" loading={upgrading} onClick={becomeSeller}>
              Sotuvchi bo&apos;lish
            </Button>
          </motion.div>
        </div>
      )}

      <div className="px-4">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white">
          {user.role !== "user" && (
            <MenuRow href="/seller" icon={<Store className="h-4.5 w-4.5" />} label="Mening e'lonlarim" />
          )}
          {user.role === "admin" && (
            <MenuRow href="/admin" icon={<ShieldCheck className="h-4.5 w-4.5" />} label="Admin panel" />
          )}
          <MenuRow href="/notifications" icon={<Bell className="h-4.5 w-4.5" />} label="Bildirishnomalar" />
          <MenuRow href="/settings" icon={<Settings className="h-4.5 w-4.5" />} label="Sozlamalar" last />
        </div>
      </div>

      <div className="px-4">
        <Button variant="outline" className="w-full" onClick={logout}>
          <LogOut className="h-4.5 w-4.5" /> Chiqish
        </Button>
      </div>
    </div>
  );
}

function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border border-border bg-white py-3.5 text-center">
      <span className="text-brand-500">{icon}</span>
      <span className="text-[15px] font-bold text-ink-900">{value}</span>
      <span className="text-[10.5px] text-ink-700/50">{label}</span>
    </div>
  );
}

function MenuRow({ href, icon, label, last }: { href: string; icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02] ${!last ? "border-b border-border" : ""}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
      <span className="flex-1 text-[14px] font-semibold text-ink-900">{label}</span>
      <ChevronRight className="h-4 w-4 text-ink-700/30" />
    </Link>
  );
}
