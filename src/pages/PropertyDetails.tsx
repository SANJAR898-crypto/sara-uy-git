import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Building,
  ChevronLeft,
  Layers,
  MapPin,
  Ruler,
  Share2,
  ShieldCheck,
  Sofa,
} from "lucide-react";
import { useState } from "react";
import { FavoriteButton, PropertyCard, SellerCard } from "../components/property";
import { Badge, Button } from "../components/ui";
import { formatPrice, useToast } from "../context";
import { properties } from "../data";
import type { Property } from "../types";
import { cn } from "../utils/cn";

export default function PropertyDetails({
  property,
  onBack,
  onOpenProperty,
}: {
  property: Property;
  onBack: () => void;
  onOpenProperty: (p: Property) => void;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const { showToast } = useToast();

  const similar = properties.filter((p) => p.category === property.category && p.id !== property.id).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="pb-8"
    >
      {/* Gallery */}
      <div className="relative aspect-[4/3.4] w-full overflow-hidden bg-ink-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            src={property.images[activeImg]}
            alt={property.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur"
          >
            <ChevronLeft className="h-5 w-5 text-ink-900" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => showToast("Havola nusxalandi", "success")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur"
            >
              <Share2 className="h-4.5 w-4.5 text-ink-900" />
            </motion.button>
            <FavoriteButton property={property} />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 flex gap-1.5">
          {property.isVip && <Badge variant="vip" icon={<Award className="h-3 w-3" />}>VIP</Badge>}
          {property.isVerified && <Badge variant="verified" icon={<ShieldCheck className="h-3 w-3" />}>Tasdiqlangan</Badge>}
        </div>
        <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur">
          {activeImg + 1}/{property.images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {property.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImg(i)}
            className={cn(
              "h-16 w-20 shrink-0 overflow-hidden rounded-[12px] ring-2 transition-all",
              activeImg === i ? "ring-brand-500" : "ring-transparent opacity-70"
            )}
          >
            <img src={img} className="h-full w-full object-cover" alt="" />
          </button>
        ))}
      </div>

      <div className="space-y-5 px-4">
        <div>
          <p className="text-display text-[26px] text-ink-900">
            {formatPrice(property.price, property.currency, property.dealType)}
          </p>
          <h1 className="mt-1 text-[17px] font-semibold text-ink-800">{property.title}</h1>
          <p className="mt-1.5 flex items-center gap-1 text-[13.5px] text-ink-700/50">
            <MapPin className="h-3.5 w-3.5" /> {property.city}, {property.district} • {property.createdAt}
          </p>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-4 gap-2.5">
          <Spec icon={<Ruler className="h-4.5 w-4.5" />} label="Maydon" value={`${property.area} m²`} />
          <Spec icon={<Sofa className="h-4.5 w-4.5" />} label="Xonalar" value={`${property.rooms}`} />
          <Spec icon={<Layers className="h-4.5 w-4.5" />} label="Qavat" value={`${property.floor}/${property.totalFloors}`} />
          <Spec icon={<Building className="h-4.5 w-4.5" />} label="Turi" value={property.dealType === "rent" ? "Ijara" : "Sotuv"} />
        </div>

        <div>
          <h3 className="text-heading mb-2 text-[16px]">Tavsif</h3>
          <p className="text-[14px] leading-relaxed text-ink-700/70">{property.description}</p>
        </div>

        <div>
          <h3 className="text-heading mb-2 text-[16px]">Joylashuv</h3>
          <div className="flex h-36 items-center justify-center rounded-[var(--radius-lg)] bg-brand-50 text-brand-400">
            <MapPin className="h-6 w-6" />
            <span className="ml-2 text-[13px] font-medium">Xarita ko'rinishi</span>
          </div>
        </div>

        <div>
          <h3 className="text-heading mb-2 text-[16px]">Sotuvchi</h3>
          <SellerCard seller={property.seller} />
        </div>

        {similar.length > 0 && (
          <div>
            <h3 className="text-heading mb-3 text-[16px]">O'xshash e'lonlar</h3>
            <div className="grid grid-cols-2 gap-3.5">
              {similar.map((p, i) => (
                <PropertyCard key={p.id} property={p} onOpen={onOpenProperty} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex gap-3 border-t border-border bg-white/95 px-4 py-3 backdrop-blur">
        <Button variant="secondary" className="flex-1" onClick={() => showToast("Xabar yuborildi", "success")}>
          Xabar yozish
        </Button>
        <Button className="flex-1" onClick={() => showToast("Qo'ng'iroq qilinmoqda...", "info")}>
          Qo'ng'iroq qilish
        </Button>
      </div>
    </motion.div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-brand-50/60 py-3 text-center">
      <div className="text-brand-500">{icon}</div>
      <p className="text-[13px] font-bold text-ink-900">{value}</p>
      <p className="text-[10px] text-ink-700/50">{label}</p>
    </div>
  );
}
