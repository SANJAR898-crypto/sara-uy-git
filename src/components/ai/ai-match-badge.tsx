"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

interface AiMatchBadgeProps {
  score: number;
  reasons?: string[];
  compact?: boolean;
  showReasons?: boolean;
}

export function AiMatchBadge({
  score,
  reasons = [],
  compact = false,
  showReasons = false,
}: AiMatchBadgeProps) {
  const color =
    score >= 85
      ? "from-green-500 to-green-600"
      : score >= 70
        ? "from-brand-500 to-brand-600"
        : score >= 50
          ? "from-amber-400 to-amber-500"
          : "from-ink-400 to-ink-500";

  const textColor =
    score >= 85
      ? "text-green-700"
      : score >= 70
        ? "text-brand-700"
        : score >= 50
          ? "text-amber-700"
          : "text-ink-600";

  const bgColor =
    score >= 85
      ? "bg-green-50"
      : score >= 70
        ? "bg-brand-50"
        : score >= 50
          ? "bg-amber-50"
          : "bg-ink-100";

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-0.5",
          bgColor
        )}
      >
        <Sparkles className={cn("h-3 w-3", textColor)} />
        <span className={cn("text-[11px] font-semibold", textColor)}>
          {score}%
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("rounded-xl overflow-hidden", bgColor)}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            color
          )}
        >
          <div className="text-center">
            <span className="text-[16px] font-bold">{score}</span>
            <span className="text-[10px]">%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className={cn("h-4 w-4", textColor)} />
            <span className={cn("text-[13px] font-semibold", textColor)}>
              AI Match
            </span>
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5">
            {score >= 85
              ? "Ajoyib mos kelish!"
              : score >= 70
                ? "Yaxshi variant"
                : score >= 50
                  ? "O'rtacha mos kelish"
                  : "Past mos kelish"}
          </p>
        </div>
      </div>

      {showReasons && reasons.length > 0 && (
        <div className="border-t border-border/50 px-3 py-2 space-y-1">
          {reasons.slice(0, 3).map((reason, i) => (
            <p key={i} className="text-[11px] text-ink-600">
              {reason}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
