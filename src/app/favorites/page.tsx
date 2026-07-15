"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingGridSkeleton } from "@/components/listings/ListingCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTelegram } from "@/contexts/TelegramProvider";
import type { ListingItem } from "@/types/api";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, isLoadingUser } = useTelegram();

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiFetch<{ items: (ListingItem & { favoritedAt: string })[] }>("/api/favorites"),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen">
      <header className="safe-top sticky top-0 z-40 glass px-4 py-4">
        <h1 className="text-lg font-extrabold text-ink-900">Sevimlilar</h1>
      </header>

      <main className="px-4 py-4">
        {!isLoadingUser && !user ? (
          <EmptyState
            icon={<Heart size={26} />}
            title="Sevimlilarni saqlash uchun kiring"
            description="Telegram orqali avtomatik ro'yxatdan o'ting"
          />
        ) : isLoading ? (
          <ListingGridSkeleton count={6} />
        ) : !data?.items.length ? (
          <EmptyState
            icon={<Heart size={26} />}
            title="Sevimlilar bo'sh"
            description="Yoqqan e'lonlarni yurak belgisi orqali saqlang"
            action={
              <Link href="/search" className="mt-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white">
                E&apos;lonlarni ko&apos;rish
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} initialFavorited />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
