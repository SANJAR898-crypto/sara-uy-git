import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { Property } from "./types";

/* ---------------- Toast ---------------- */
export interface ToastItem {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, variant?: ToastItem["variant"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastItem["variant"] = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  return <ToastContext.Provider value={{ toasts, showToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ---------------- Favorites ---------------- */
interface FavoritesContextValue {
  favoriteIds: Set<string>;
  toggleFavorite: (property: Property) => boolean;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback((property: Property) => {
    let added = false;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(property.id)) {
        next.delete(property.id);
        added = false;
      } else {
        next.add(property.id);
        added = true;
      }
      return next;
    });
    return added;
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const value = useMemo(() => ({ favoriteIds, toggleFavorite, isFavorite }), [favoriteIds, toggleFavorite, isFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

/* ---------------- Formatting helpers ---------------- */
export function formatPrice(price: number, currency: string, dealType: string) {
  const formatted = new Intl.NumberFormat("en-US").format(price);
  const suffix = dealType === "rent" ? "/oy" : "";
  return `${currency === "USD" ? "$" : ""}${formatted}${currency === "UZS" ? " so'm" : ""}${suffix}`;
}
