"use client";

import { motion } from "framer-motion";
import { Eye, Heart, MessageCircle, Percent, Phone, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState, Loader } from "@/components/ui";
import type { ListingAnalytics } from "@/types";

export default function ListingStatsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [analytics, setAnalytics] = useState<ListingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetch(`/api/seller/properties/${id}/analytics`)
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setAnalytics(data.analytics))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader className="pt-16" />;
  if (error || !analytics) return <ErrorState onRetry={load} />;

  const maxViews = Math.max(1, ...analytics.daily.map((d) => d.views));

  return (
    <div className="space-y-6 px-4 pb-6 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Eye className="h-4.5 w-4.5" />} label="Ko'rishlar" value={analytics.totals.views} />
        <StatCard icon={<Heart className="h-4.5 w-4.5" />} label="Sevimlilar" value={analytics.totals.favorites} />
        <StatCard icon={<Send className="h-4.5 w-4.5" />} label="Telegram" value={analytics.totals.telegramContacts} />
        <StatCard icon={<Phone className="h-4.5 w-4.5" />} label="Qo'ng'iroqlar" value={analytics.totals.phoneCalls} />
        <StatCard icon={<MessageCircle className="h-4.5 w-4.5" />} label="Xabarlar" value={analytics.totals.messages} />
        <StatCard icon={<Percent className="h-4.5 w-4.5" />} label="Konversiya" value={analytics.totals.conversionRate} suffix="%" />
      </div>

      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">Oxirgi 14 kunlik ko&apos;rishlar</h3>
        <div className="flex items-end justify-between gap-1 rounded-[var(--radius-lg)] border border-border bg-white p-4" style={{ height: 150 }}>
          {analytics.daily.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                className="w-full rounded-t-md bg-brand-500"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, (d.views / maxViews) * 100)}px` }}
                transition={{ duration: 0.5 }}
              />
              <span className="text-[8.5px] text-ink-700/40">{d.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-2.5 text-[18px] font-bold text-ink-900">
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="text-[11px] text-ink-700/50">{label}</p>
    </div>
  );
}
