"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Home as HomeIcon, Warehouse, TreePine, Store, Castle } from "lucide-react";

const CATEGORIES = [
  { code: "apartment", label: "Kvartira", icon: Building2 },
  { code: "house", label: "Uy / Hovli", icon: HomeIcon },
  { code: "villa", label: "Villa", icon: Castle },
  { code: "commercial", label: "Tijorat", icon: Store },
  { code: "land", label: "Yer", icon: TreePine },
  { code: "warehouse", label: "Ombor", icon: Warehouse },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <motion.div
            key={cat.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/search?propertyType=${cat.code}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3.5 shadow-soft ring-1 ring-black/[0.03] transition-transform active:scale-95"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={22} />
              </div>
              <span className="text-xs font-semibold text-ink-700">{cat.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
