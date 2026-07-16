"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Building2,
  Castle,
  ChevronLeft,
  Eye,
  Home as HomeIcon,
  Key,
  Map as MapIcon,
  MapPin,
  Phone,
  Ruler,
  Share2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FavoriteButton, MapEmbed, PropertyCard, SellerCard } from "@/components/property";
import { Button, ErrorState, Loader } from "@/components/ui";
import { useToast } from "@/components/providers";
import { formatPrice } from "@/lib/format";
import { attachBackButton, shareLink } from "@/lib/telegram-client";
import type { Property } from "@/types";

const categoryIcon: Record<string, typeof HomeIcon> = {
  apartment: Building2,
  house: HomeIcon,
  villa: Castle,
  office: Briefcase,
  land: MapIcon,
  rent: Key,
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const id = params?.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [related, setRelated] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetch(`/api/properties/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setProperty(data.property);
        setActiveImage(0);
        fetch("/api/properties?limit=60")
          .then((r) => r.json())
          .then((relData) => {
            const list: Property[] = (relData.properties ?? []).filter(
              (p: Property) => p.id !== data.property.id && p.category === data.property.category
            );
            setRelated(list.slice(0, 8));
          })
          .catch(() => {});
        fetch(`/api/properties/${id}/view`, { method: "POST" }).catch(() => {});
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const detach = attachBackButton(() => router.back());
    return detach;
  }, [router]);

  const handleShare = async () => {
    if (!property) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const result = await shareLink(url, property.title);
    if (result === "clipboard") showToast("Havola nusxalandi", "success");
    else if (result === "none") showToast("Ulashib bo'lmadi", "error");
  };

  if (loading) {
    return (
      <div className="pb-10 pt-4">
        <div className="px-4">
          <button onClick={() => router.back()} className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4">
          <div className="aspect-[4/3] w-full animate-pulse rounded-[var(--radius-lg)] bg-brand-50" />
        </div>
        <Loader />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pb-10 pt-4">
        <div className="px-4">
          <button onClick={() => router.back()} className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <ErrorState onRetry={load} />
      </div>
    );
  }

  const Icon = categoryIcon[property.category] ?? HomeIcon;

  return (
    <div className="pb-10">
      {/* Gallery */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
        <AnimatePresence mode="wait">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            key={activeImage}
            src={property.images[activeImage] ?? property.images[0]}
            alt={property.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>

        <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-sm backdrop-blur"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-sm backdrop-blur"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
            <FavoriteButton property={property} />
          </div>
        </div>

        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {property.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImage ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute left-3 top-16 flex flex-col gap-1.5">
          {property.isVip && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f3d27a] to-[var(--color-vip)] px-2.5 py-1 text-[10px] font-bold text-[#5c4108] shadow-[var(--shadow-vip)] w-fit">
              <Award className="h-3 w-3" /> VIP
            </span>
          )}
          {property.isNew && (
            <span className="w-fit rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold text-white">YANGI</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-5 px-4 pt-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-display text-[24px] leading-tight text-ink-900">
              {formatPrice(property.price, property.currency, property.dealType)}
            </h1>
            <span className="mt-1 flex items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-ink-700/60">
              <Eye className="h-3.5 w-3.5" /> {property.views}
            </span>
          </div>
          <p className="mt-1.5 text-[16px] font-semibold text-ink-800">{property.title}</p>
          <p className="mt-1 flex items-center gap-1 text-[13.5px] text-ink-700/50">
            <MapPin className="h-3.5 w-3.5" />
            {property.address ?? `${property.district}, ${property.city}`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Icon className="h-4.5 w-4.5" />} label="Toifa" value={property.category} />
          <StatCard icon={<Ruler className="h-4.5 w-4.5" />} label="Maydon" value={`${property.area} m²`} />
          <StatCard
            icon={<HomeIcon className="h-4.5 w-4.5" />}
            label="Xonalar"
            value={property.rooms > 0 ? String(property.rooms) : "—"}
          />
        </div>

        {(property.floor || property.totalFloors) && (
          <div className="rounded-[var(--radius-lg)] border border-border bg-white p-4 text-[13.5px] text-ink-700/70">
            Qavat: <span className="font-semibold text-ink-900">{property.floor ?? "—"}</span>
            {property.totalFloors && (
              <>
                {" "}
                / <span className="font-semibold text-ink-900">{property.totalFloors}</span>
              </>
            )}
          </div>
        )}

        <div>
          <h3 className="text-heading mb-2 text-[16px] text-ink-900">Tavsif</h3>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-700/70">{property.description}</p>
        </div>

        <div>
          <h3 className="text-heading mb-2 text-[16px] text-ink-900">Sotuvchi</h3>
          <SellerCard seller={property.seller} />
        </div>

        <div>
          <h3 className="text-heading mb-2 text-[16px] text-ink-900">Joylashuv</h3>
          <MapEmbed lat={property.lat} lng={property.lng} label={property.title} />
        </div>

        {related.length > 0 && (
          <div>
            <h3 className="text-heading mb-3 text-[16px] text-ink-900">O&apos;xshash e&apos;lonlar</h3>
            <div className="no-scrollbar flex gap-3.5 overflow-x-auto pb-1">
              {related.map((p, i) => (
                <div key={p.id} className="w-[200px] shrink-0">
                  <PropertyCard property={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex justify-center border-t border-border/70 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex w-full max-w-lg items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (property.seller.phone) window.location.href = `tel:${property.seller.phone}`;
              else showToast("Telefon raqami mavjud emas", "info");
            }}
          >
            <Phone className="h-4.5 w-4.5" /> Qo&apos;ng&apos;iroq
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              if (property.seller.username) {
                window.open(`https://t.me/${property.seller.username}`, "_blank", "noopener,noreferrer");
              } else {
                showToast("Telegram username mavjud emas", "info");
              }
            }}
          >
            Telegram&apos;da yozish
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border border-border bg-white py-3.5 text-center">
      <span className="text-brand-500">{icon}</span>
      <span className="text-[13px] font-bold capitalize text-ink-900">{value}</span>
      <span className="text-[10.5px] text-ink-700/50">{label}</span>
    </div>
  );
}
