"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ErrorState, Loader } from "@/components/ui";
import { useToast } from "@/components/providers";
import { cn } from "@/lib/cn";
import type { SellerSubscriptionInfo, SubscriptionPlan } from "@/types";

export default function SubscriptionPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<SellerSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/seller/subscription")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => {
        setPlans(data.plans ?? []);
        setCurrent(data.current ?? null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const choosePlan = async (key: string) => {
    setSwitching(key);
    try {
      const res = await fetch("/api/seller/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: key }),
      });
      if (res.ok) {
        showToast("Tarif faollashtirildi", "success");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Xatolik yuz berdi", "error");
      }
    } finally {
      setSwitching(null);
    }
  };

  if (loading) return <Loader className="pt-16" />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="space-y-4 px-4 pb-6 pt-1">
      {current && (
        <div className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[#08233a] via-[#0b5c94] to-brand-500 p-4 text-white">
          <p className="text-[12.5px] text-white/70">Joriy tarif</p>
          <p className="mt-0.5 text-[20px] font-bold">{current.plan.name}</p>
          {current.expiresAt && (
            <p className="mt-1 text-[12px] text-white/60">Tugash sanasi: {new Date(current.expiresAt).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {plans.map((plan, i) => {
        const isCurrent = current?.plan.key === plan.key;
        return (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            className={cn(
              "rounded-[var(--radius-lg)] border-2 bg-white p-4",
              isCurrent ? "border-brand-500 shadow-[var(--shadow-brand)]" : "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {plan.key !== "free" && <Sparkles className="h-4 w-4 text-brand-500" />}
                <p className="text-[16px] font-bold text-ink-900">{plan.name}</p>
              </div>
              <p className="text-[16px] font-bold text-brand-600">
                {plan.priceMonthly > 0 ? `$${plan.priceMonthly}/oy` : "Bepul"}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[12.5px] text-ink-700/70">
                  <Check className="h-3.5 w-3.5 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-4 w-full"
              variant={isCurrent ? "outline" : "primary"}
              disabled={isCurrent}
              loading={switching === plan.key}
              onClick={() => choosePlan(plan.key)}
            >
              {isCurrent ? "Joriy tarif" : "Tanlash"}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
