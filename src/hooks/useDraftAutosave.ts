"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave for the listing creation wizard. Persists the current
 * step + form data to `/api/seller/drafts` shortly after the user stops
 * typing, and exposes a status flag for a small "Saved" indicator in the UI.
 */
export function useDraftAutosave(step: number, data: Record<string, unknown>, enabled: boolean) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSerialized = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify({ step, data });
    if (serialized === lastSerialized.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/seller/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step, data }),
        });
        if (res.ok) {
          lastSerialized.current = serialized;
          setStatus("saved");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }, 900);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, data, enabled]);

  const clearDraft = useCallback(async () => {
    try {
      await fetch("/api/seller/drafts", { method: "DELETE" });
    } catch {
      /* best-effort */
    }
  }, []);

  return { status, clearDraft };
}

/** Fetches the seller's saved wizard draft once on mount, if any. */
export function useRestoreDraft() {
  const [draft, setDraft] = useState<{ step: number; data: Record<string, unknown> } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/seller/drafts")
      .then((r) => r.json())
      .then((data) => setDraft(data.draft ?? null))
      .catch(() => setDraft(null));
  }, []);

  return draft; // undefined = loading, null = none found
}
