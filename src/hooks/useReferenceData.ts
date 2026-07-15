"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Region, StoryItem, SubscriptionPlan } from "@/types/api";

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => apiFetch<{ regions: Region[] }>("/api/regions"),
    staleTime: Infinity,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => apiFetch<{ plans: SubscriptionPlan[] }>("/api/plans"),
    staleTime: Infinity,
  });
}

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => apiFetch<{ stories: StoryItem[] }>("/api/stories"),
  });
}
