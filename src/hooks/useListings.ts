"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ListingItem } from "@/types/api";

export interface ListingsFilters {
  dealType?: string;
  propertyType?: string;
  regionId?: string;
  districtId?: string;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  q?: string;
  featured?: "vip" | "premium";
  sort?: string;
  sellerId?: number;
  page?: number;
  pageSize?: number;
}

function buildQuery(filters: ListingsFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function useListings(filters: ListingsFilters = {}) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () =>
      apiFetch<{ items: ListingItem[]; total: number }>(`/api/listings?${buildQuery(filters)}`),
  });
}

export function useListing(id: number | string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => apiFetch<{ listing: ListingItem; isFavorited: boolean }>(`/api/listings/${id}`),
    enabled: id !== undefined,
  });
}
