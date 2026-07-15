"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: "text-emerald-500",
  error: "text-rose-500",
  info: "text-brand-500",
};

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+12px)] z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="glass pointer-events-auto flex max-w-sm items-center gap-2 rounded-2xl px-4 py-3 shadow-elevated"
            >
              <Icon size={18} className={COLORS[toast.type]} />
              <span className="text-sm font-medium text-ink-900">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
