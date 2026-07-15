"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useListings, type ListingsFilters } from "@/hooks/useListings";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingGridSkeleton } from "@/components/listings/ListingCardSkeleton";
import { FiltersSheet } from "@/components/search/FiltersSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { useRouterBack } from "@/hooks/useRouterBack";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const goBack = useRouterBack();

  const [filters, setFilters] = useState<ListingsFilters>({
    dealType: searchParams.get("dealType") ?? undefined,
    propertyType: searchParams.get("propertyType") ?? undefined,
    featured: (searchParams.get("featured") as "vip" | "premium") ?? undefined,
    sort: searchParams.get("sort") ?? "newest",
  });
  const [queryText, setQueryText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const ai = searchParams.get("ai");
    if (!ai) return;
    setQueryText(ai);
    apiFetch<{ filters: Record<string, unknown> }>("/api/search/ai", {
      method: "POST",
      body: JSON.stringify({ query: ai }),
    })
      .then(({ filters: parsed }) => {
        setFilters((prev) => ({
          ...prev,
          rooms: (parsed.rooms as number) ?? prev.rooms,
          minPrice: (parsed.minPrice as number) ?? prev.minPrice,
          maxPrice: (parsed.maxPrice as number) ?? prev.maxPrice,
          minArea: (parsed.minArea as number) ?? prev.minArea,
          dealType: (parsed.dealType as string) ?? prev.dealType,
          propertyType: (parsed.propertyType as string) ?? prev.propertyType,
        }));
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useListings({ ...filters, q: queryText || undefined });
  const items = data?.items ?? [];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <header className="safe-top sticky top-0 z-40 glass px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft">
            <ArrowLeft size={18} />
          </button>
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Qidirish..."
            className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm shadow-soft focus:outline-none"
          />
          <button
            onClick={() => setFiltersOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft"
          >
            <SlidersHorizontal size={17} />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="px-4 py-4">
        <p className="mb-3 text-sm text-ink-400">{isLoading ? "Qidirilmoqda..." : `${data?.total ?? 0} ta e'lon topildi`}</p>

        {isLoading ? (
          <ListingGridSkeleton count={8} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Hech narsa topilmadi"
            description="Filtrlarni o'zgartirib qayta urinib ko'ring"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          router.replace("/search");
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
