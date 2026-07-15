"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, PlusCircle, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTelegram } from "@/contexts/TelegramProvider";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "Bosh sahifa", icon: Home },
  { href: "/search", label: "Qidiruv", icon: Search },
  { href: "/seller/new", label: "E'lon", icon: PlusCircle, isAction: true },
  { href: "/favorites", label: "Sevimlilar", icon: Heart },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { haptic } = useTelegram();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
      <div className="glass mx-auto flex max-w-md items-center justify-between rounded-3xl px-2 py-2 shadow-elevated">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.isAction) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => haptic("medium")}
                className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/40 transition-transform active:scale-90"
              >
                <Icon size={26} strokeWidth={2.2} />
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => haptic("light")}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-colors active:scale-95"
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl bg-brand-50"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                size={21}
                strokeWidth={2.2}
                className={cn("relative z-10", active ? "text-brand-600" : "text-ink-400")}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] font-semibold",
                  active ? "text-brand-600" : "text-ink-400",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
