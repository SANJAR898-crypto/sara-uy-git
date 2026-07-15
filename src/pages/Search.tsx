import { motion } from "framer-motion";
import { Clock, Filter, SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryChips, PropertyCard } from "../components/property";
import { BottomSheet, Button, EmptyState } from "../components/ui";
import { categories, properties } from "../data";
import type { Property } from "../types";
import { cn } from "../utils/cn";

const recentSearches = ["Yunusobod 3 xona", "VIP villa", "Chilonzor ijara", "Ofis Toshkent"];

export default function Search({ onOpenProperty }: { onOpenProperty: (p: Property) => void }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dealType, setDealType] = useState<"all" | "sale" | "rent">("all");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRooms, setMinRooms] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(0);

  const results = useMemo(() => {
    return properties.filter((p) => {
      if (query && !`${p.title} ${p.district} ${p.city}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (dealType !== "all" && p.dealType !== dealType) return false;
      if (p.price > maxPrice) return false;
      if (p.rooms < minRooms) return false;
      return true;
    });
  }, [query, activeCategory, dealType, maxPrice, minRooms]);

  const applyFilters = () => {
    let count = 0;
    if (dealType !== "all") count++;
    if (maxPrice < 200000) count++;
    if (minRooms > 0) count++;
    setAppliedFilters(count);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDealType("all");
    setMaxPrice(200000);
    setMinRooms(0);
    setAppliedFilters(0);
  };

  return (
    <div className="space-y-4 pb-6 pt-4">
      <div className="flex items-center gap-2.5 px-4">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
          <SearchIcon className="h-4.5 w-4.5 text-ink-700/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Manzil, tuman, kalit so'z..."
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-700/40"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="h-4 w-4 text-ink-700/40" />
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setFiltersOpen(true)}
          className={cn(
            "relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)]",
            appliedFilters > 0 ? "bg-brand-500 text-white" : "border border-border bg-white text-ink-900"
          )}
        >
          <SlidersHorizontal className="h-4.5 w-4.5" />
          {appliedFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white ring-2 ring-bg">
              {appliedFilters}
            </span>
          )}
        </motion.button>
      </div>

      <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />

      {!query && (
        <div className="px-4">
          <p className="mb-2 text-[13px] font-semibold text-ink-700/50">So'nggi qidiruvlar</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((r) => (
              <button
                key={r}
                onClick={() => setQuery(r)}
                className="flex items-center gap-1.5 rounded-full bg-white border border-border px-3 py-1.5 text-[12.5px] text-ink-700/70"
              >
                <Clock className="h-3 w-3" /> {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4">
        <p className="mb-3 text-[13px] font-semibold text-ink-700/50">{results.length} ta natija topildi</p>
        {results.length === 0 ? (
          <EmptyState
            icon={<Filter className="h-9 w-9" />}
            title="Natija topilmadi"
            message="Boshqa kalit so'z yoki filtrlarni sinab ko'ring."
            action={
              <Button size="sm" variant="secondary" onClick={resetFilters} className="mt-1">
                Filtrlarni tozalash
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {results.map((p, i) => (
              <PropertyCard key={p.id} property={p} onOpen={onOpenProperty} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtrlar">
        <div className="space-y-6 pt-2">
          <div>
            <p className="mb-2.5 text-[13px] font-semibold text-ink-900">Bitim turi</p>
            <div className="flex gap-2">
              {(["all", "sale", "rent"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDealType(d)}
                  className={cn(
                    "flex-1 rounded-[var(--radius-md)] border py-2.5 text-[13px] font-semibold transition-colors",
                    dealType === d ? "border-brand-500 bg-brand-500 text-white" : "border-border text-ink-700/70"
                  )}
                >
                  {d === "all" ? "Barchasi" : d === "sale" ? "Sotuv" : "Ijara"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink-900">Maksimal narx</p>
              <p className="text-[13px] font-bold text-brand-500">${maxPrice.toLocaleString()}</p>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div>
            <p className="mb-2.5 text-[13px] font-semibold text-ink-900">Minimal xonalar soni</p>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setMinRooms(n)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors",
                    minRooms === n ? "border-brand-500 bg-brand-500 text-white" : "border-border text-ink-700/70"
                  )}
                >
                  {n === 0 ? "Har" : n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              Tozalash
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Qo'llash
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
