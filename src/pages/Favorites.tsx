import { Heart } from "lucide-react";
import { PropertyCard } from "../components/property";
import { EmptyState } from "../components/ui";
import { useFavorites } from "../context";
import { properties } from "../data";
import type { Property } from "../types";

export default function Favorites({ onOpenProperty }: { onOpenProperty: (p: Property) => void }) {
  const { favoriteIds } = useFavorites();
  const favProperties = properties.filter((p) => favoriteIds.has(p.id));

  return (
    <div className="min-h-[70vh] space-y-4 pb-6 pt-5">
      <h1 className="text-display px-4 text-[22px] text-ink-900">Sevimlilar</h1>
      {favProperties.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-9 w-9" />}
          title="Hozircha bo'sh"
          message="Sizga yoqqan e'lonlarni yurak belgisi orqali shu yerga saqlang."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 px-4">
          {favProperties.map((p, i) => (
            <PropertyCard key={p.id} property={p} onOpen={onOpenProperty} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
