"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState, Loader } from "@/components/ui";
import { ListingWizard } from "@/components/seller/listing-wizard";
import type { Property } from "@/types";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetch(`/api/properties/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setProperty(data.property))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader className="pt-16" />;
  if (error || !property) return <ErrorState onRetry={load} />;

  return <ListingWizard mode="edit" initialProperty={property} />;
}
