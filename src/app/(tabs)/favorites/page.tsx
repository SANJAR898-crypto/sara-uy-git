"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/property";
import { EmptyState, PropertyCardSkeleton } from "@/components/ui";
import { useFavorites } from "@/components/providers";
import type { Property } from "@/types";

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setProperties(data.properties ?? []))
      .finally(() => setLoading(false));
  }, [favoriteIds.size]);

  return (
    <div className="min-h-[70vh] space-y-4 pb-6 pt-5">
      <h1 className="text-display px-4 text-[22px] text-ink-900">Sevimlilar</h1>
      {loading ? (
        <div className="grid grid-cols-2 gap-3.5 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-9 w-9" />}
          title="Hozircha bo'sh"
          message="Sizga yoqqan e'lonlarni yurak belgisi orqali shu yerga saqlang."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 px-4">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
