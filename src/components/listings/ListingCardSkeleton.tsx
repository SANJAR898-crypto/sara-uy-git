export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/[0.03]">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-4 w-2/3 rounded-md" />
        <div className="skeleton h-3.5 w-full rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
