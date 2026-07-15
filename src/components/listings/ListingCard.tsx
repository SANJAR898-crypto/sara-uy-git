"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, BedDouble, Ruler } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ListingItem } from "@/types/api";
import { formatArea, formatPrice, DEAL_TYPE_LABELS, timeAgo } from "@/lib/format";
import { apiFetch } from "@/lib/api-client";
import { useTelegram } from "@/contexts/TelegramProvider";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/cn";

const PLAN_BADGES: Record<string, { label: string; className: string }> = {
  vip: { label: "🥇 VIP", className: "bg-gold-500 text-white" },
  premium: { label: "🥈 Premium", className: "bg-brand-500 text-white" },
  story: { label: "🎬 Story", className: "bg-fuchsia-500 text-white" },
};

interface ListingCardProps {
  listing: ListingItem;
  initialFavorited?: boolean;
  priority?: boolean;
}

export function ListingCard({ listing, initialFavorited = false, priority = false }: ListingCardProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [burst, setBurst] = useState(false);
  const { user, haptic } = useTelegram();
  const toast = useToastStore((s) => s.show);
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (favorited) {
        await apiFetch(`/api/listings/${listing.id}/favorite`, { method: "DELETE" });
      } else {
        await apiFetch(`/api/listings/${listing.id}/favorite`, { method: "POST" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Sevimlilarga qo'shish uchun Telegram orqali kiring", "info");
      return;
    }
    haptic("light");
    const next = !favorited;
    setFavorited(next);
    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
    toggleFavorite.mutate();
  };

  const badge = PLAN_BADGES[listing.plan];
  const cover = listing.images[0];

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="group overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/[0.03] transition-shadow hover:shadow-elevated"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
          {cover ? (
            <Image
              src={cover}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-200">
              <BedDouble size={32} />
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {badge && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold shadow", badge.className)}>
                {badge.label}
              </span>
            )}
          </div>

          <button
            onClick={handleFavorite}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur transition-transform active:scale-90"
            aria-label="Sevimlilarga qo'shish"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                favorited ? "fill-rose-500 text-rose-500" : "text-ink-600",
              )}
            />
            {burst && (
              <motion.span
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="pointer-events-none absolute inline-block h-4 w-4 rounded-full bg-rose-400"
              />
            )}
          </button>

          <div className="absolute bottom-2 left-2 rounded-lg bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            {DEAL_TYPE_LABELS[listing.dealType] ?? listing.dealType}
          </div>
        </div>

        <div className="space-y-1.5 p-3">
          <p className="truncate text-[15px] font-bold text-ink-900">{formatPrice(listing.price, listing.currency)}</p>
          <p className="line-clamp-1 text-sm text-ink-600">{listing.title}</p>

          <div className="flex items-center gap-3 pt-0.5 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <BedDouble size={13} /> {listing.rooms} xona
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={13} /> {formatArea(listing.area)}
            </span>
          </div>

          <div className="flex items-center gap-1 truncate pt-0.5 text-xs text-ink-400">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{listing.address}</span>
          </div>

          <p className="pt-1 text-[11px] text-ink-400">{timeAgo(listing.createdAt)}</p>
        </div>
      </motion.article>
    </Link>
  );
}
