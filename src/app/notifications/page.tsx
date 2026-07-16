"use client";

import { Bell, CheckCheck, Percent, ShieldAlert, Sparkles, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { InnerHeader } from "@/components/layout";
import { EmptyState, ErrorState, Loader } from "@/components/ui";
import { attachBackButton } from "@/lib/telegram-client";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types";

const typeIcon: Record<AppNotification["type"], React.ReactNode> = {
  price: <Tag className="h-4.5 w-4.5" />,
  message: <Bell className="h-4.5 w-4.5" />,
  system: <ShieldAlert className="h-4.5 w-4.5" />,
  vip: <Sparkles className="h-4.5 w-4.5" />,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setItems(data.notifications ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => attachBackButton(() => router.back()), [router]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id) }),
    });
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen">
      <InnerHeader
        title="Bildirishnomalar"
        right={
          unreadCount > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-600"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Barchasi
            </button>
          ) : undefined
        }
      />

      <div className="space-y-2.5 px-4 py-4">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState icon={<Bell className="h-9 w-9" />} title="Bildirishnomalar yo'q" message="Hozircha yangi bildirishnoma mavjud emas." />
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`flex w-full items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
                n.read ? "border-border bg-white" : "border-brand-200 bg-brand-50/60"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                {typeIcon[n.type] ?? <Percent className="h-4.5 w-4.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-ink-900">{n.title}</p>
                <p className="mt-0.5 text-[13px] text-ink-700/70">{n.message}</p>
                <p className="mt-1 text-[11.5px] text-ink-700/40">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
