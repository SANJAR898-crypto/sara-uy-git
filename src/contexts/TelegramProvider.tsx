"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TelegramWebApp, TelegramWebAppUser } from "@/types/telegram-webapp";

export interface AppUser {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isSeller: boolean;
  phoneNumber: string | null;
  phoneVerified: boolean;
  sellerRating: string;
  isBanned: boolean;
}

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  tgUser: TelegramWebAppUser | null;
  isInTelegram: boolean;
  isReady: boolean;
  user: AppUser | null;
  isAdmin: boolean;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
  haptic: (style?: "light" | "medium" | "heavy") => void;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error("useTelegram must be used within TelegramProvider");
  return ctx;
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user ?? null);
      setIsAdmin(!!data.isAdmin);
    } catch {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const tg = window.Telegram?.WebApp ?? null;

      if (tg) {
        try {
          tg.ready();
          tg.expand();
          tg.setHeaderColor?.("#0082D5");
        } catch {
          // ignore unsupported methods on older clients
        }
        setWebApp(tg);
      }

      setIsReady(true);

      const initData = tg?.initData;
      try {
        if (initData) {
          await fetch("/api/auth/telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ initData }),
          });
        }
      } catch {
        // network errors shouldn't block guest browsing
      } finally {
        if (!cancelled) await refreshUser();
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const haptic = (style: "light" | "medium" | "heavy" = "light") => {
    webApp?.HapticFeedback?.impactOccurred(style);
  };

  const value = useMemo<TelegramContextValue>(
    () => ({
      webApp,
      tgUser: webApp?.initDataUnsafe?.user ?? null,
      isInTelegram: !!webApp,
      isReady,
      user,
      isAdmin,
      isLoadingUser,
      refreshUser,
      haptic,
    }),
    [webApp, isReady, user, isAdmin, isLoadingUser],
  );

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}
