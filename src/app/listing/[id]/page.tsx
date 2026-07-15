"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BedDouble,
  Heart,
  MapPin,
  Phone,
  Ruler,
  Send,
  Share2,
  Building,
  Flag,
  Star,
} from "lucide-react";
import { useListing } from "@/hooks/useListings";
import { formatArea, formatPrice, DEAL_TYPE_LABELS, PROPERTY_TYPE_LABELS, AMENITY_LABELS, timeAgo } from "@/lib/format";
import { apiFetch } from "@/lib/api-client";
import { useTelegram } from "@/contexts/TelegramProvider";
import { useToastStore } from "@/store/useToastStore";
import { useRouterBack } from "@/hooks/useRouterBack";
import { cn } from "@/lib/cn";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data, isLoading, refetch } = useListing(id);
  const { user, webApp, haptic } = useTelegram();
  const toast = useToastStore((s) => s.show);
  const goBack = useRouterBack("/");
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (data) setFavorited(data.isFavorited);
  }, [data]);

  useEffect(() => {
    if (id) apiFetch(`/api/listings/${id}/view`, { method: "POST" }).catch(() => undefined);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="skeleton aspect-[4/3] w-full" />
        <div className="space-y-3 p-4">
          <div className="skeleton h-6 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-ink-500">E&apos;lon topilmadi yoki hali tasdiqlanmagan.</p>
      </div>
    );
  }

  const { listing } = data;

  async function toggleFavorite() {
    if (!user) {
      toast("Sevimlilarga qo'shish uchun Telegram orqali kiring", "info");
      return;
    }
    haptic("medium");
    const next = !favorited;
    setFavorited(next);
    try {
      await apiFetch(`/api/listings/${listing.id}/favorite`, { method: next ? "POST" : "DELETE" });
    } catch {
      setFavorited(!next);
    }
  }

  async function handleCall() {
    if (!listing.owner?.phone) {
      toast("Telefon raqami mavjud emas", "error");
      return;
    }
    await apiFetch(`/api/listings/${listing.id}/contact`, {
      method: "POST",
      body: JSON.stringify({ contactType: "call" }),
    }).catch(() => undefined);
    window.location.href = `tel:${listing.owner.phone}`;
  }

  async function handleTelegram() {
    await apiFetch(`/api/listings/${listing.id}/contact`, {
      method: "POST",
      body: JSON.stringify({ contactType: "telegram" }),
    }).catch(() => undefined);
    const username = listing.owner?.username?.replace("@", "");
    const url = username ? `https://t.me/${username}` : "https://t.me";
    if (webApp) webApp.openTelegramLink(url);
    else window.open(url, "_blank");
  }

  async function handleShare() {
    await apiFetch(`/api/listings/${listing.id}/contact`, {
      method: "POST",
      body: JSON.stringify({ contactType: "share" }),
    }).catch(() => undefined);
    const shareUrl = `${window.location.origin}/listing/${listing.id}`;
    if (navigator.share) {
      navigator.share({ title: listing.title, url: shareUrl }).catch(() => undefined);
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast("Havola nusxalandi", "success");
    }
  }

  async function handleReport() {
    try {
      await apiFetch(`/api/listings/${listing.id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: "incorrect_info", description: "" }),
      });
      toast("Shikoyat yuborildi, rahmat!", "success");
    } catch {
      toast("Shikoyat yuborish uchun tizimga kiring", "error");
    }
  }

  return (
    <div className="min-h-screen pb-6">
      <div className="relative aspect-[4/3] w-full bg-ink-900">
        {listing.images.length > 0 ? (
          <Image src={listing.images[activeImage]} alt={listing.title} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-white/40">
            <Building size={40} />
          </div>
        )}

        <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button onClick={goBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
              <Share2 size={16} />
            </button>
            <button onClick={toggleFavorite} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
              <Heart size={16} className={cn(favorited ? "fill-rose-500 text-rose-500" : "text-ink-700")} />
            </button>
          </div>
        </div>

        {listing.images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {listing.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn("h-1.5 rounded-full transition-all", i === activeImage ? "w-5 bg-white" : "w-1.5 bg-white/50")}
              />
            ))}
          </div>
        )}
      </div>

      {listing.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
          {listing.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2",
                i === activeImage ? "ring-brand-500" : "ring-transparent",
              )}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-5 px-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
              {DEAL_TYPE_LABELS[listing.dealType]}
            </span>
            <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-bold text-ink-600">
              {PROPERTY_TYPE_LABELS[listing.propertyType]}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900">
            {formatPrice(listing.price, listing.currency)}
            {listing.isNegotiable && <span className="ml-2 text-sm font-medium text-ink-400">Kelishilgan</span>}
          </h1>
          <p className="mt-1 text-[15px] font-semibold text-ink-700">{listing.title}</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-ink-400">
            <MapPin size={14} /> {listing.address}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03]">
          <div className="flex flex-col items-center gap-1">
            <BedDouble size={18} className="text-brand-500" />
            <span className="text-sm font-bold">{listing.rooms} xona</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-ink-100">
            <Ruler size={18} className="text-brand-500" />
            <span className="text-sm font-bold">{formatArea(listing.area)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Building size={18} className="text-brand-500" />
            <span className="text-sm font-bold">{listing.floor ? `${listing.floor}/${listing.maxFloors ?? "-"}` : "-"}</span>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-base font-bold text-ink-900">Tavsif</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{listing.description}</p>
        </div>

        {listing.amenities.length > 0 && (
          <div>
            <h2 className="mb-2 text-base font-bold text-ink-900">Qulayliklar</h2>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((a) => (
                <span key={a} className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600">
                  {AMENITY_LABELS[a] ?? a}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03]">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-brand-100">
              {listing.owner?.avatarUrl && (
                <Image src={listing.owner.avatarUrl} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink-900">{listing.owner?.name || "Sotuvchi"}</p>
              {listing.owner?.agencyName && <p className="text-xs text-ink-400">{listing.owner.agencyName}</p>}
              <div className="mt-0.5 flex items-center gap-1 text-xs text-gold-500">
                <Star size={12} className="fill-gold-500" /> {listing.owner?.rating ?? "0.0"}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-ink-400">
          E&apos;lon berilgan: {timeAgo(listing.createdAt)} · {listing.viewsCount} marta ko&apos;rilgan
        </p>

        <button onClick={handleReport} className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
          <Flag size={13} /> Shikoyat qilish
        </button>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-ink-100 bg-white p-3"
      >
        <button
          onClick={handleCall}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink-900 py-3.5 text-sm font-bold text-white active:scale-95"
        >
          <Phone size={16} /> Qo&apos;ng&apos;iroq
        </button>
        <button
          onClick={handleTelegram}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white active:scale-95"
        >
          <Send size={16} /> Telegram
        </button>
      </motion.div>
    </div>
  );
}
