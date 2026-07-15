"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastHost } from "@/components/ui/ToastHost";
import { useTelegram } from "@/contexts/TelegramProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const { isReady } = useTelegram();
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => setShowSplash(false), 900);
    return () => clearTimeout(timer);
  }, [isReady]);

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>
      <ToastHost />
      <div className={isAdminRoute ? "" : "pb-24"}>{children}</div>
      {!isAdminRoute && <BottomNav />}
    </>
  );
}
