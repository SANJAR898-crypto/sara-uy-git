"use client";

import { motion } from "framer-motion";
import {
  Archive,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Heart,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState, Loader } from "@/components/ui";
import { useToast } from "@/components/providers";
import type { SellerDashboardStats } from "@/types";

export default function SellerDashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/seller/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader className="pt-16" />;
  if (error || !stats) return <ErrorState onRetry={load} />;

  const maxWeekly = Math.max(1, ...stats.weekly.map((w) => w.views));

  return (
    <div className="space-y-6 px-4 pb-6 pt-1">
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/seller/listings/new">
          <QuickAction icon={<Plus className="h-4.5 w-4.5" />} label="Yangi e'lon" primary />
        </Link>
        <Link href="/seller/listings">
          <QuickAction icon={<FileEdit className="h-4.5 w-4.5" />} label="E'lonlarni boshqarish" />
        </Link>
      </div>

      {/* Subscription summary */}
      <Link href="/seller/subscription">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[#08233a] via-[#0b5c94] to-brand-500 p-4 text-white shadow-[var(--shadow-lift)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5" />
              <p className="text-[14px] font-bold">{stats.subscription.plan.name} tarifi</p>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-bold uppercase">{stats.subscription.status}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
            <UsageBar label="E'lonlar" used={stats.subscription.usage.listings} total={stats.subscription.plan.maxListings} />
            <UsageBar label="VIP" used={stats.subscription.usage.vipListings} total={stats.subscription.plan.maxVipListings} />
            <UsageBar label="Premium" used={stats.subscription.usage.premiumListings} total={stats.subscription.plan.maxPremiumListings} />
          </div>
        </motion.div>
      </Link>

      {/* Listing totals */}
      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">E&apos;lonlar holati</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<TrendingUp className="h-4.5 w-4.5" />} label="Jami" value={stats.totals.total} />
          <StatCard icon={<CheckCircle2 className="h-4.5 w-4.5" />} label="Faol" value={stats.totals.active} />
          <StatCard icon={<FileEdit className="h-4.5 w-4.5" />} label="Qoralama" value={stats.totals.draft} />
          <StatCard icon={<Clock className="h-4.5 w-4.5" />} label="Kutilmoqda" value={stats.totals.pending} />
          <StatCard icon={<XCircle className="h-4.5 w-4.5" />} label="Rad etilgan" value={stats.totals.rejected} />
          <StatCard icon={<Archive className="h-4.5 w-4.5" />} label="Arxiv" value={stats.totals.archived} />
          <StatCard icon={<Star className="h-4.5 w-4.5" />} label="VIP" value={stats.totals.vip} accent="vip" />
          <StatCard icon={<Sparkles className="h-4.5 w-4.5" />} label="Premium" value={stats.totals.premium} accent="premium" />
          <StatCard icon={<Award className="h-4.5 w-4.5" />} label="Sotilgan" value={stats.totals.sold} />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">Faollik</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Eye className="h-4.5 w-4.5" />} label="Ko'rishlar" value={stats.engagement.views} />
          <StatCard icon={<Heart className="h-4.5 w-4.5" />} label="Sevimlilar" value={stats.engagement.favorites} />
          <StatCard icon={<Send className="h-4.5 w-4.5" />} label="Telegram murojaat" value={stats.engagement.telegramContacts} />
          <StatCard icon={<Phone className="h-4.5 w-4.5" />} label="Qo'ng'iroqlar" value={stats.engagement.phoneCalls} />
        </div>
      </div>

      {/* Weekly chart */}
      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">Haftalik ko&apos;rishlar</h3>
        <div className="flex items-end justify-between gap-2 rounded-[var(--radius-lg)] border border-border bg-white p-4" style={{ height: 140 }}>
          {stats.weekly.map((w) => (
            <div key={w.date} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                className="w-full rounded-t-md bg-brand-500"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, (w.views / maxWeekly) * 90)}px` }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-[9.5px] text-ink-700/40">{w.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top listings */}
      {stats.topListings.length > 0 && (
        <div>
          <h3 className="text-heading mb-3 text-[15px] text-ink-900">Eng ko&apos;p ko&apos;rilgan e&apos;lonlar</h3>
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-border bg-white p-2">
            {stats.topListings.map((t, i) => (
              <Link
                key={t.id}
                href={`/seller/listings/${t.id}/stats`}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-2.5 active:bg-black/[0.02]"
                onClick={() => showToast("Statistika ochilmoqda...", "info")}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-600">
                    {i + 1}
                  </span>
                  <span className="truncate text-[13px] font-semibold text-ink-900">{t.title}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[11.5px] text-ink-700/50">
                  <Eye className="h-3.5 w-3.5" /> {t.views}
                  <Heart className="h-3.5 w-3.5" /> {t.favoritesCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, label, primary }: { icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className={`flex h-24 flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border p-3 text-center ${
        primary ? "border-brand-500 bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "border-border bg-white text-ink-800"
      }`}
    >
      {icon}
      <span className="text-[12.5px] font-bold">{label}</span>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "vip" | "premium";
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          accent === "vip" ? "bg-vip-bg text-vip-dark" : accent === "premium" ? "bg-violet-50 text-violet-600" : "bg-brand-50 text-brand-600"
        }`}
      >
        {icon}
      </span>
      <p className="mt-2.5 text-[18px] font-bold text-ink-900">{value.toLocaleString()}</p>
      <p className="text-[11px] text-ink-700/50">{label}</p>
    </div>
  );
}

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div>
      <p className="font-bold">
        {used}/{total}
      </p>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-white/70">{label}</p>
    </div>
  );
}
