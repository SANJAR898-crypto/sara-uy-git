"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CurrentUser } from "@/types";
import "@/lib/telegram-client";

/* ============================================================
   Telegram WebApp bootstrap + Session
   (Window.Telegram type is declared centrally in @/lib/telegram-client)
   ============================================================ */

interface SessionContextValue {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
      webApp?.ready();
      webApp?.expand();
      const initData = webApp?.initData ?? "";

      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/me", { method: "DELETE" });
    setUser(null);
    await bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading, refresh, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

/* ============================================================
   Toast
   ============================================================ */
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

/* ============================================================
   Favorites
   ============================================================ */
interface FavoritesContextValue {
  favoriteIds: Set<string>;
  loaded: boolean;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        setFavoriteIds(new Set<string>(data.favoriteIds ?? []));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    let added = false;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
        added = false;
      } else {
        next.add(propertyId);
        added = true;
      }
      return next;
    });

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: Number(propertyId) }),
      });
      if (res.ok) {
        const data = await res.json();
        added = Boolean(data.favorited);
      }
    } catch {
      // keep optimistic state on network failure
    }
    return added;
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const value = useMemo(
    () => ({ favoriteIds, loaded, toggleFavorite, isFavorite }),
    [favoriteIds, loaded, toggleFavorite, isFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
