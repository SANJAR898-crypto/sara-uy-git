"use client";

import { motion } from "framer-motion";
import { Award, BarChart3, LayoutList, ShieldX, User as UserIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { InnerHeader } from "@/components/layout";
import { EmptyState, Loader } from "@/components/ui";
import { useSession } from "@/components/providers";
import { attachBackButton } from "@/lib/telegram-client";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/seller", label: "Boshqaruv", icon: BarChart3 },
  { href: "/seller/listings", label: "E'lonlarim", icon: LayoutList },
  { href: "/seller/subscription", label: "Obuna", icon: Wallet },
  { href: "/seller/profile", label: "Profil", icon: UserIcon },
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => attachBackButton(() => router.back()), [router]);

  const titleMap: Record<string, string> = {
    "/seller": "Sotuvchi paneli",
    "/seller/listings": "Mening e'lonlarim",
    "/seller/subscription": "Obuna rejasi",
    "/seller/profile": "Sotuvchi profili",
  };
  const isSubPage = pathname.includes("/listings/new") || /\/listings\/[^/]+\/(edit|stats)/.test(pathname ?? "");

  if (loading) {
    return (
      <div className="min-h-screen">
        <InnerHeader title="Sotuvchi paneli" />
        <Loader className="pt-16" />
      </div>
    );
  }

  if (!user || !["seller", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen">
        <InnerHeader title="Sotuvchi paneli" />
        <EmptyState
          icon={<ShieldX className="h-9 w-9" />}
          title="Ruxsat yo'q"
          message="Bu bo'lim faqat sotuvchilar uchun. Profilingizda sotuvchi bo'ling."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <InnerHeader title={titleMap[pathname ?? ""] ?? "Sotuvchi paneli"} />

      {!isSubPage && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors",
                  active ? "border-brand-500 bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "border-border bg-white text-ink-700/70"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {user.role === "admin" && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-vip-bg px-3 py-2.5 text-[12px] font-bold text-vip-dark">
              <Award className="h-3.5 w-3.5" /> Admin
            </span>
          )}
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    </div>
  );
}
