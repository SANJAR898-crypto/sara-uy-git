"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function AiSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?ai=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="px-4">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 rounded-2xl bg-white p-3.5 shadow-soft ring-1 ring-black/[0.03]"
      >
        <Sparkles size={18} className="shrink-0 text-brand-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Masalan: 3 xona Chilonzor 600 mln gacha"
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white active:scale-95"
        >
          Qidirish
        </button>
      </motion.div>
    </form>
  );
}
