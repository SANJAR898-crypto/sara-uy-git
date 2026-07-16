"use client";

import { motion } from "framer-motion";
import {
  Archive,
  BarChart3,
  Copy,
  Eye,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, BottomSheet, Button, EmptyState, ErrorState, Loader } from "@/components/ui";
import { useToast } from "@/components/providers";
import { formatPrice } from "@/lib/format";
import { PROPERTY_STATUS_META } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Property, PropertyStatus } from "@/types";

const FILTERS: { id: PropertyStatus | "all"; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "draft", label: "Qoralama" },
  { id: "pending", label: "Kutilmoqda" },
  { id: "active", label: "Faol" },
  { id: "paused", label: "To'xtatilgan" },
  { id: "rejected", label: "Rad etilgan" },
  { id: "sold", label: "Sotilgan" },
  { id: "archived", label: "Arxiv" },
];

export default function SellerListingsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [menuFor, setMenuFor] = useState<Property | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = (status = filter) => {
    setLoading(true);
    setError(false);
    fetch(`/api/seller/properties?status=${status}`)
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.properties ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const runAction = async (property: Property, action: string) => {
    setBusyId(property.id);
    try {
      const res = await fetch(`/api/seller/properties/${property.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast("Amal bajarildi", "success");
        load(filter);
      } else {
        showToast(data.error ?? "Xatolik yuz berdi", "error");
      }
    } finally {
      setBusyId(null);
      setMenuFor(null);
    }
  };

  const duplicate = async (property: Property) => {
    setBusyId(property.id);
    try {
      const res = await fetch(`/api/seller/properties/${property.id}/actions`, { method: "PUT" });
      if (res.ok) {
        showToast("E'lon nusxalandi (qoralama sifatida)", "success");
        load(filter);
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setBusyId(null);
      setMenuFor(null);
    }
  };

  const remove = async (property: Property) => {
    if (!confirm(`"${property.title}" o'chirilsinmi?`)) return;
    setBusyId(property.id);
    try {
      const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("E'lon o'chirildi", "info");
        load(filter);
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setBusyId(null);
      setMenuFor(null);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-1">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              filter === f.id ? "border-brand-500 bg-brand-50 text-brand-600" : "border-border bg-white text-ink-700/60"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState onRetry={() => load(filter)} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-9 w-9" />}
          title="E'lonlar yo'q"
          message="Birinchi e'loningizni joylashtiring."
          action={
            <Link href="/seller/listings/new">
              <Button size="sm" className="mt-1">
                E&apos;lon qo&apos;shish
              </Button>
            </Link>
          }
        />
      ) : (
        items.map((p, i) => {
          const status = PROPERTY_STATUS_META[p.status] ?? PROPERTY_STATUS_META.pending;
          const busy = busyId === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-[var(--radius-lg)] border border-border bg-white p-3"
            >
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.title} className="h-20 w-20 shrink-0 rounded-[var(--radius-md)] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[14px] font-bold text-ink-900">{p.title}</p>
                    <button onClick={() => setMenuFor(p)} className="shrink-0 rounded-full p-1 text-ink-700/50 hover:bg-black/[0.04]">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[13px] font-semibold text-brand-600">{formatPrice(p.price, p.currency, p.dealType)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {p.isVip && <Badge variant="vip">VIP</Badge>}
                    {p.isPremium && <Badge variant="rent">Premium</Badge>}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-700/50">
                    <Eye className="h-3 w-3" /> {p.views} • {p.district}
                  </p>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="mt-1 text-[11.5px] text-error">Sabab: {p.rejectionReason}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/seller/listings/${p.id}/edit`}>
                  <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold text-ink-700">
                    <Pencil className="h-3 w-3" /> Tahrirlash
                  </button>
                </Link>
                <Link href={`/seller/listings/${p.id}/stats`}>
                  <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold text-ink-700">
                    <BarChart3 className="h-3 w-3" /> Statistika
                  </button>
                </Link>
                <Link href={`/property/${p.id}`}>
                  <button className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold text-ink-700">
                    <Eye className="h-3 w-3" /> Ko&apos;rish
                  </button>
                </Link>
                <button
                  disabled={busy}
                  onClick={() => duplicate(p)}
                  className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 disabled:opacity-40"
                >
                  <Copy className="h-3 w-3" /> Nusxalash
                </button>
              </div>
            </motion.div>
          );
        })
      )}

      {!loading && !error && items.length > 0 && (
        <div className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4">
          <Link href="/seller/listings/new" className="w-full max-w-lg">
            <Button size="lg" className="w-full shadow-[var(--shadow-lift)]">
              <Plus className="h-4.5 w-4.5" /> Yangi e&apos;lon qo&apos;shish
            </Button>
          </Link>
        </div>
      )}

      <BottomSheet open={!!menuFor} onClose={() => setMenuFor(null)} title={menuFor?.title}>
        {menuFor && (
          <div className="space-y-2 pt-1">
            {menuFor.status === "active" && (
              <MenuAction icon={<Pause className="h-4 w-4" />} label="To'xtatib turish" onClick={() => runAction(menuFor, "pause")} disabled={busyId === menuFor.id} />
            )}
            {["paused", "archived", "expired"].includes(menuFor.status) && (
              <MenuAction icon={<Play className="h-4 w-4" />} label="Faollashtirish" onClick={() => runAction(menuFor, "activate")} disabled={busyId === menuFor.id} />
            )}
            {menuFor.status === "draft" && (
              <MenuAction icon={<Play className="h-4 w-4" />} label="Ko'rib chiqishga yuborish" onClick={() => runAction(menuFor, "submit_for_review")} disabled={busyId === menuFor.id} />
            )}
            <MenuAction icon={<RefreshCw className="h-4 w-4" />} label="Muddatini uzaytirish" onClick={() => runAction(menuFor, "renew")} disabled={busyId === menuFor.id} />
            {menuFor.status !== "sold" && (
              <MenuAction icon={<Star className="h-4 w-4" />} label="Sotilgan deb belgilash" onClick={() => runAction(menuFor, "mark_sold")} disabled={busyId === menuFor.id} />
            )}
            {!menuFor.isVip ? (
              <MenuAction icon={<Star className="h-4 w-4" />} label="VIP qilish" onClick={() => runAction(menuFor, "promote_vip")} disabled={busyId === menuFor.id} />
            ) : (
              <MenuAction icon={<X className="h-4 w-4" />} label="VIP dan olib tashlash" onClick={() => runAction(menuFor, "unpromote_vip")} disabled={busyId === menuFor.id} />
            )}
            {!menuFor.isPremium ? (
              <MenuAction icon={<Sparkles className="h-4 w-4" />} label="Premium qilish" onClick={() => runAction(menuFor, "promote_premium")} disabled={busyId === menuFor.id} />
            ) : (
              <MenuAction icon={<X className="h-4 w-4" />} label="Premium dan olib tashlash" onClick={() => runAction(menuFor, "unpromote_premium")} disabled={busyId === menuFor.id} />
            )}
            {menuFor.status !== "archived" && (
              <MenuAction icon={<Archive className="h-4 w-4" />} label="Arxivlash" onClick={() => runAction(menuFor, "archive")} disabled={busyId === menuFor.id} />
            )}
            <MenuAction icon={<Trash2 className="h-4 w-4" />} label="O'chirish" danger onClick={() => remove(menuFor)} disabled={busyId === menuFor.id} />
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function MenuAction({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3 text-[14px] font-semibold transition-colors disabled:opacity-40",
        danger ? "text-error hover:bg-error-bg" : "text-ink-900 hover:bg-black/[0.03]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
