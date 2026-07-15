"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useTelegram } from "@/contexts/TelegramProvider";

export function Header() {
  const { user } = useTelegram();

  return (
    <header className="safe-top sticky top-0 z-40 glass px-4 py-3">
      <div className="flex items-center justify-between">
        <Logo size={38} />
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-600 shadow-soft active:scale-90"
          >
            <Search size={18} />
          </Link>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-600 shadow-soft active:scale-90">
            <Bell size={18} />
            {user && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500" />}
          </button>
        </div>
      </div>
    </header>
  );
}
