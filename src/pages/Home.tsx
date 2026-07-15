import { motion } from "framer-motion";
import { ChevronRight, Percent, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryChips, PropertyCard, StoryBar, StoryViewer } from "../components/property";
import { PropertyCardSkeleton } from "../components/ui";
import { categories, properties, stories } from "../data";
import type { Property, Story } from "../types";

export default function Home({
  onOpenProperty,
  onOpenSearch,
  loading,
}: {
  onOpenProperty: (p: Property) => void;
  onOpenSearch: () => void;
  loading: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const filtered = useMemo(
    () => (activeCategory ? properties.filter((p) => p.category === activeCategory) : properties),
    [activeCategory]
  );

  const featured = filtered.filter((p) => p.isVip).slice(0, 6);
  const latest = filtered.slice(0, 12);

  return (
    <div className="space-y-6 pb-4 pt-4">
      <div className="px-4">
        <button
          onClick={onOpenSearch}
          className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-white px-4 py-3.5 text-left shadow-[var(--shadow-soft)] active:scale-[0.99] transition-transform"
        >
          <Sparkles className="h-4.5 w-4.5 text-brand-400" />
          <span className="text-[14px] text-ink-700/50">Uy, kvartira, villa qidiring...</span>
        </button>
      </div>

      <StoryBar stories={stories} onOpen={setActiveStory} />
      <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />

      {/* Promo banner */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[#08233a] via-[#0b5c94] to-brand-500 p-5 text-white shadow-[var(--shadow-lift)]"
        >
          <motion.div
            className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
          <div className="relative flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-100">
            <ShieldCheck className="h-3.5 w-3.5" /> Ishonchli platforma
          </div>
          <h2 className="text-display relative mt-2 max-w-[220px] text-[21px] leading-tight text-white">
            VIP e'lon joylang — 3x ko'proq mijoz toping
          </h2>
          <button className="relative mt-4 flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-brand-600">
            Batafsil <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>

      <div>
        <SectionTitle title="Toifalar" />
        <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />
      </div>

      {featured.length > 0 && (
        <div>
          <SectionTitle title="Tavsiya etilgan" badge="VIP" />
          <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-4 pb-1">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-[220px] shrink-0">
                    <PropertyCardSkeleton />
                  </div>
                ))
              : featured.map((p, i) => (
                  <div key={p.id} className="w-[220px] shrink-0">
                    <PropertyCard property={p} onOpen={onOpenProperty} index={i} />
                  </div>
                ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle title="Yangi e'lonlar" badge={<Percent className="h-3.5 w-3.5" />} />
        <div className="grid grid-cols-2 gap-3.5 px-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : latest.map((p, i) => <PropertyCard key={p.id} property={p} onOpen={onOpenProperty} index={i} />)}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, badge }: { title: string; badge?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between px-4">
      <h2 className="text-heading text-[18px] text-ink-900">{title}</h2>
      {badge && (
        <span className="flex items-center gap-1 rounded-full bg-vip-bg px-2.5 py-1 text-[11px] font-bold text-vip-dark">
          {badge}
        </span>
      )}
    </div>
  );
}
