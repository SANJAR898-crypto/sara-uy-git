"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Building2,
  Castle,
  Eye,
  Heart,
  Home as HomeIcon,
  Key,
  Map,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useFavorites, useToast } from "@/components/providers";
import type { Property, Seller, Story } from "@/types";

const categoryIcon: Record<string, typeof HomeIcon> = {
  apartment: Building2,
  house: HomeIcon,
  villa: Castle,
  office: Briefcase,
  land: Map,
  rent: Key,
};

/* ============== Category Chips ============== */
export function CategoryChips({
  categories,
  active,
  onSelect,
}: {
  categories: { id: string; label: string; icon: string }[];
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1">
      <Chip label="Barchasi" active={active === null} onClick={() => onSelect(null)} icon={<Sparkles className="h-4 w-4" />} />
      {categories.map((c) => {
        const Icon = categoryIcon[c.id] ?? HomeIcon;
        return (
          <Chip
            key={c.id}
            label={c.label}
            active={active === c.id}
            onClick={() => onSelect(c.id)}
            icon={<Icon className="h-4 w-4" />}
          />
        );
      })}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors",
        active
          ? "border-brand-500 bg-brand-500 text-white shadow-[var(--shadow-brand)]"
          : "border-border bg-white text-ink-700/70 hover:border-brand-200"
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}

/* ============== Story Bar ============== */
export function StoryBar({ stories, onOpen }: { stories: Story[]; onOpen: (s: Story) => void }) {
  if (stories.length === 0) return null;
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-1">
      {stories.map((s) => (
        <motion.button
          key={s.id}
          whileTap={{ scale: 0.92 }}
          onClick={() => onOpen(s)}
          className="flex shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              "flex h-[68px] w-[68px] items-center justify-center rounded-full p-[2.5px]",
              s.seen
                ? "bg-black/10"
                : s.isVip
                  ? "bg-gradient-to-tr from-[#f3d27a] via-[var(--color-vip)] to-[#a3812a]"
                  : "bg-gradient-to-tr from-brand-300 via-brand-500 to-brand-700"
            )}
          >
            <div className="h-full w-full rounded-full bg-white p-[2px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.avatar} className="h-full w-full rounded-full object-cover" alt={s.name} />
            </div>
          </div>
          <span className="max-w-[68px] truncate text-[11px] font-medium text-ink-700/70">{s.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ============== Story Viewer ============== */
export function StoryViewer({ story, onClose }: { story: Story | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {story && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative h-full w-full max-w-lg overflow-hidden"
          >
            <div className="safe-top absolute left-0 right-0 top-0 z-10 flex gap-1 px-3 pt-3">
              <motion.div className="h-1 flex-1 rounded-full bg-white/30" initial={{ opacity: 1 }}>
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  onAnimationComplete={onClose}
                />
              </motion.div>
            </div>
            <div className="safe-top absolute left-3 right-3 top-7 z-10 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={story.avatar} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/60" alt="" />
              <span className="text-[14px] font-semibold text-white">{story.name}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.image} className="h-full w-full object-cover" alt={story.name} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-10 pt-16">
              <p className="text-[15px] font-semibold text-white">Yangi e&apos;lonlarni ko&apos;rish uchun bosing</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============== Favorite Heart Button (with burst animation) ============== */
export function FavoriteButton({ property, size = "md" }: { property: Property; size?: "sm" | "md" }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [burst, setBurst] = useState(false);
  const active = isFavorite(property.id);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const added = await toggleFavorite(property.id);
    if (added) {
      setBurst(true);
      showToast("Sevimlilarga qo'shildi", "success");
      setTimeout(() => setBurst(false), 700);
    } else {
      showToast("Sevimlilardan olib tashlandi", "info");
    }
  };

  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <button
      onClick={handleClick}
      className={cn("relative flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur", dim)}
    >
      <motion.div animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
        <Heart className={cn(iconDim, active ? "fill-error text-error" : "text-ink-700")} />
      </motion.div>
      <AnimatePresence>
        {burst && (
          <>
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-error"
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos(angle) * 26,
                    y: Math.sin(angle) * 26,
                    scale: 0,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ============== Property Card ============== */
export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Link href={`/property/${property.id}`} className="block w-full">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
        whileTap={{ scale: 0.97 }}
        className="group block w-full overflow-hidden rounded-[var(--radius-lg)] bg-card text-left shadow-[var(--shadow-card)] transition-shadow active:shadow-[var(--shadow-soft)]"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
          {!loaded && <div className="absolute inset-0 shimmer-bg" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.images[0]}
            alt={property.title}
            onLoad={() => setLoaded(true)}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {property.isVip && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f3d27a] to-[var(--color-vip)] px-2.5 py-1 text-[10px] font-bold text-[#5c4108] shadow-[var(--shadow-vip)]">
                <Award className="h-3 w-3" /> VIP
              </span>
            )}
            {property.isNew && (
              <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold text-white">YANGI</span>
            )}
            {property.dealType === "rent" && (
              <span className="rounded-full bg-violet-500 px-2.5 py-1 text-[10px] font-bold text-white">IJARA</span>
            )}
          </div>
          <div className="absolute right-2.5 top-2.5">
            <FavoriteButton property={property} size="sm" />
          </div>
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            <Eye className="h-3 w-3" /> {property.views}
          </div>
        </div>
        <div className="space-y-1.5 p-3">
          <p className="text-heading truncate text-[15px] text-ink-900">
            {formatPrice(property.price, property.currency, property.dealType)}
          </p>
          <p className="truncate text-[13px] font-medium text-ink-800/80">{property.title}</p>
          <div className="flex items-center gap-2 text-[12px] text-ink-700/50">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" /> {property.district}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Ruler className="h-3 w-3" /> {property.area} m²
            </span>
            {property.isVerified && (
              <span className="ml-auto flex items-center gap-0.5 text-emerald-500">
                <Award className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ============== Seller Card ============== */
export function SellerCard({ seller }: { seller: Seller }) {
  const { showToast } = useToast();
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-4">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={seller.avatar} className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-50" alt={seller.name} />
        {seller.verified && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
            <Award className="h-3 w-3 text-white" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-ink-900">{seller.name}</p>
        <p className="text-[12.5px] text-ink-700/50">
          {seller.isAgency ? "Agentlik" : "Xususiy shaxs"} • {seller.dealsCount} bitim
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-[12.5px] font-semibold text-vip-dark">⭐ {seller.rating}</div>
      </div>
      <div className="flex flex-col gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => showToast(seller.phone ? `Qo'ng'iroq: ${seller.phone}` : "Telefon raqami mavjud emas", "info")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-brand)]"
        >
          <Phone className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => showToast("Xabar oynasi ochilmoqda...", "info")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <MessageCircle className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}

/* ============== Map Embed (OpenStreetMap, no API key required) ============== */
export function MapEmbed({ lat, lng, label }: { lat: number | null; lng: number | null; label?: string }) {
  if (lat == null || lng == null) {
    return (
      <div className="flex h-36 items-center justify-center rounded-[var(--radius-lg)] bg-brand-50 text-brand-400">
        <MapPin className="h-6 w-6" />
        <span className="ml-2 text-[13px] font-medium">Manzil ko&apos;rsatilmagan</span>
      </div>
    );
  }
  const delta = 0.01;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  const externalUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <iframe title={label ?? "Xarita"} src={src} className="h-44 w-full" loading="lazy" />
      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 bg-white py-2.5 text-[12.5px] font-semibold text-brand-600"
      >
        <MapPin className="h-3.5 w-3.5" /> Kattaroq xaritada ochish
      </a>
    </div>
  );
}
