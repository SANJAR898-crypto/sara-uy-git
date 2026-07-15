"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/ui/Logo";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-brand-500 via-brand-600 to-brand-800"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rounded-[2rem] bg-white/15 p-3 backdrop-blur">
          <LogoMark size={88} className="!bg-white/95 shadow-2xl" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Sara Uylar</h1>
        <p className="mt-1 text-sm font-medium text-white/70">
          O&apos;zbekistondagi ishonchli ko&apos;chmas mulk platformasi
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-16 flex items-center gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-white/80"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
