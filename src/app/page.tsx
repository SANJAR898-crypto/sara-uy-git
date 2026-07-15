"use client";

import { Header } from "@/components/layout/Header";
import { StoriesBar } from "@/components/home/StoriesBar";
import { AiSearchBar } from "@/components/home/AiSearchBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingGridSkeleton } from "@/components/listings/ListingCardSkeleton";
import { useListings } from "@/hooks/useListings";

function ListingsSection({
  title,
  subtitle,
  href,
  filters,
}: {
  title: string;
  subtitle?: string;
  href: string;
  filters: Parameters<typeof useListings>[0];
}) {
  const { data, isLoading } = useListings(filters);
  const items = data?.items ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionHeader title={title} subtitle={subtitle} href={href} />
      <div className="px-4">
        {isLoading ? (
          <ListingGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="space-y-6 pt-4">
        <StoriesBar />
        <AiSearchBar />
        <CategoryGrid />

        <ListingsSection
          title="VIP e'lonlar"
          subtitle="Eng ishonchli takliflar"
          href="/search?featured=vip"
          filters={{ featured: "vip", sort: "newest", pageSize: 4 }}
        />

        <ListingsSection
          title="Yangi qo'shilganlar"
          subtitle="So'nggi joylashtirilgan e'lonlar"
          href="/search?sort=newest"
          filters={{ sort: "newest", pageSize: 8 }}
        />

        <ListingsSection
          title="Ommabop e'lonlar"
          subtitle="Ko'p ko'rilgan uy-joylar"
          href="/search?sort=popular"
          filters={{ sort: "popular", pageSize: 4 }}
        />
      </main>
    </div>
  );
}
