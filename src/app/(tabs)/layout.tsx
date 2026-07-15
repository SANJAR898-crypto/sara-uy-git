"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BottomNav, SplashScreen, TopNav } from "@/components/layout";
import { BottomSheet } from "@/components/ui";
import { CITIES } from "@/lib/constants";

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [cityOpen, setCityOpen] = useState(false);
  const [city, setCity] = useState("Toshkent");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem("sara_seen_splash");
    if (seen) setShowSplash(false);
  }, []);

  useEffect(() => {
    if (!showSplash) sessionStorage.setItem("sara_seen_splash", "1");
  }, [showSplash]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setUnreadCount((data.notifications ?? []).filter((n: { read: boolean }) => !n.read).length))
      .catch(() => {});
  }, [pathname]);

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}</AnimatePresence>

      {!showSplash && (
        <>
          {pathname !== "/profile" && (
            <TopNav unreadCount={unreadCount} city={city} onCityClick={() => setCityOpen(true)} />
          )}
          {children}
          <BottomNav />
          <div className="h-24" />
        </>
      )}

      <BottomSheet open={cityOpen} onClose={() => setCityOpen(false)} title="Shaharni tanlang">
        <div className="space-y-1 pt-1">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCity(c);
                setCityOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-3 text-[14px] font-medium transition-colors ${
                city === c ? "bg-brand-50 text-brand-600" : "text-ink-900 hover:bg-black/[0.03]"
              }`}
            >
              {c}
              {city === c && <span className="text-brand-500">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
