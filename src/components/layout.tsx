"use client";

import { motion } from "framer-motion";
import { Bell, ChevronDown, Heart, Home, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

/* ============== Splash Screen ============== */
export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 1600);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#08233a] via-[#0b3a5c] to-brand-500"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full bg-brand-400/30 blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center"
      >
        <motion.div
          initial={{ boxShadow: "0 0 0px rgba(255,255,255,0)" }}
          animate={{ boxShadow: "0 0 60px rgba(255,255,255,0.35)" }}
          transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse" }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/10 p-3 backdrop-blur-md ring-1 ring-white/30"
        >
          <Image src="/images/logo.png" alt="Sara Uylar" width={96} height={96} className="h-full w-full rounded-[20px] object-cover" priority />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-display text-[26px] tracking-tight text-white"
        >
          SARA UYLAR
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-1.5 text-[13px] font-medium tracking-[0.2em] text-white/60"
        >
          PREMIUM KO&apos;CHMAS MULK
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-16 flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-white/70"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ============== Top Navigation ============== */
export function TopNav({
  unreadCount,
  city,
  onCityClick,
}: {
  unreadCount: number;
  city: string;
  onCityClick: () => void;
}) {
  return (
    <div className="safe-top sticky top-0 z-40 glass border-b border-border/70">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[12px] shadow-[var(--shadow-brand)]">
            <Image src="/images/logo.png" width={36} height={36} className="h-full w-full object-cover" alt="logo" />
          </div>
          <button onClick={onCityClick} className="flex items-center gap-0.5 active:opacity-60">
            <div className="text-left leading-tight">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-700/50">Sara Uylar</p>
              <p className="flex items-center gap-0.5 text-[14px] font-bold text-ink-900">
                {city} <ChevronDown className="h-3.5 w-3.5" />
              </p>
            </div>
          </button>
        </div>
        <Link href="/notifications">
          <motion.span
            whileTap={{ scale: 0.85 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] active:bg-black/[0.08]"
          >
            <Bell className="h-[19px] w-[19px] text-ink-900" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold text-white ring-2 ring-white"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.span>
        </Link>
      </div>
    </div>
  );
}

/* ============== Bottom Navigation ============== */
const tabs = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/search", label: "Qidiruv", icon: Search },
  { href: "/favorites", label: "Sevimli", icon: Heart },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-3 pt-1">
      <div className="glass flex w-full max-w-lg items-center justify-between rounded-[26px] border border-white/60 px-2 py-2 shadow-[var(--shadow-lift)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2">
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-0 rounded-2xl bg-brand-500"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <motion.div
                className="relative z-10"
                animate={isActive ? { y: -2, scale: 1.08 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon
                  className={cn("h-[21px] w-[21px] transition-colors", isActive ? "text-white" : "text-ink-700/50")}
                  strokeWidth={isActive ? 2.4 : 2}
                />
              </motion.div>
              <span
                className={cn(
                  "relative z-10 text-[10px] font-semibold transition-colors",
                  isActive ? "text-white" : "text-ink-700/50"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
