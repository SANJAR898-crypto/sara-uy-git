"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

interface PriceAdvice {
  low: number;
  fair: number;
  high: number;
  currency: string;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  pricePerSqm?: number;
  marketComparison: "below" | "fair" | "above";
  estimatedDemand: "low" | "medium" | "high";
  estimatedSellingDays: number;
  similarListings: Array<{
    id: string;
    title: string;
    price: number;
    area: number;
    rooms: number;
  }>;
}

interface AiPriceAdvisorProps {
  category: string;
  dealType: string;
  city: string;
  district?: string;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  currentPrice?: number;
  onPriceSelect?: (price: number) => void;
}

export function AiPriceAdvisor({
  category,
  dealType,
  city,
  district,
  rooms,
  area,
  floor,
  totalFloors,
  currentPrice,
  onPriceSelect,
}: AiPriceAdvisorProps) {
  const [advice, setAdvice] = useState<PriceAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!category || !dealType || !city) return;

    const fetchAdvice = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          category,
          dealType,
          city,
        });
        if (district) params.append("district", district);
        if (rooms) params.append("rooms", String(rooms));
        if (area) params.append("area", String(area));
        if (floor) params.append("floor", String(floor));
        if (totalFloors) params.append("totalFloors", String(totalFloors));

        const res = await fetch(`/api/ai/price-advice?${params}`);
        const data = await res.json();

        if (data.advice) {
          setAdvice(data.advice);
        } else {
          setError(data.message || "Ma'lumot topilmadi");
        }
      } catch {
        setError("Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [category, dealType, city, district, rooms, area, floor, totalFloors]);

  if (loading) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          <span className="text-[14px] text-brand-700">AI bozor tahlili...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-[13px]">{error}</span>
        </div>
      </div>
    );
  }

  if (!advice) return null;

  const pricePosition =
    currentPrice && currentPrice > 0
      ? currentPrice < advice.low
        ? "below"
        : currentPrice > advice.high
          ? "above"
          : "fair"
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-heading text-[14px] text-ink-900">AI Narx Maslahati</h3>
            <p className="text-[11px] text-ink-500">
              {advice.sampleSize} ta o'xshash e'lon tahlili
            </p>
          </div>
        </div>
        <div
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            advice.confidence === "high"
              ? "bg-green-100 text-green-700"
              : advice.confidence === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          )}
        >
          {advice.confidence === "high"
            ? "Yuqori aniqlik"
            : advice.confidence === "medium"
              ? "O'rtacha"
              : "Past aniqlik"}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-ink-500">Tavsiya etilgan narx oralig'i</span>
          {advice.pricePerSqm && (
            <span className="text-[11px] text-ink-500">
              ~{formatPrice(advice.pricePerSqm, advice.currency)}/m²
            </span>
          )}
        </div>
        
        <div className="relative h-8 rounded-full bg-gradient-to-r from-green-200 via-brand-200 to-amber-200">
          {/* Fair price marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-brand-600"
            style={{ left: "50%" }}
          />
          
          {/* Current price marker if set */}
          {currentPrice && currentPrice > 0 && (
            <div
              className={cn(
                "absolute top-0 h-full w-1 rounded-full",
                pricePosition === "below"
                  ? "bg-green-600"
                  : pricePosition === "above"
                    ? "bg-red-500"
                    : "bg-brand-600"
              )}
              style={{
                left: `${Math.min(100, Math.max(0, ((currentPrice - advice.low) / (advice.high - advice.low)) * 100))}%`,
              }}
            />
          )}
        </div>
        
        <div className="mt-1 flex justify-between text-[11px]">
          <span className="text-green-600">{formatPrice(advice.low, advice.currency)}</span>
          <span className="font-semibold text-brand-600">
            {formatPrice(advice.fair, advice.currency)}
          </span>
          <span className="text-amber-600">{formatPrice(advice.high, advice.currency)}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-white p-2 text-center border border-border">
          <div className="flex items-center justify-center gap-1 text-ink-600">
            {advice.estimatedDemand === "high" ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : advice.estimatedDemand === "low" ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : (
              <BarChart3 className="h-3 w-3" />
            )}
          </div>
          <p className="text-[11px] font-medium text-ink-700 mt-0.5">
            {advice.estimatedDemand === "high"
              ? "Yuqori talab"
              : advice.estimatedDemand === "low"
                ? "Past talab"
                : "O'rtacha"}
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-2 text-center border border-border">
          <div className="flex items-center justify-center">
            <Clock className="h-3 w-3 text-ink-500" />
          </div>
          <p className="text-[11px] font-medium text-ink-700 mt-0.5">
            ~{advice.estimatedSellingDays} kun
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-2 text-center border border-border">
          <div className="flex items-center justify-center">
            <DollarSign className="h-3 w-3 text-ink-500" />
          </div>
          <p className="text-[11px] font-medium text-ink-700 mt-0.5">
            {advice.sampleSize} ta taqqoslash
          </p>
        </div>
      </div>

      {/* Price position warning */}
      {pricePosition && (
        <div
          className={cn(
            "mb-4 rounded-lg p-3",
            pricePosition === "below"
              ? "bg-green-50 border border-green-200"
              : pricePosition === "above"
                ? "bg-amber-50 border border-amber-200"
                : "bg-brand-50 border border-brand-200"
          )}
        >
          <div className="flex items-start gap-2">
            {pricePosition === "below" ? (
              <ArrowDown className="h-4 w-4 text-green-600 mt-0.5" />
            ) : pricePosition === "above" ? (
              <ArrowUp className="h-4 w-4 text-amber-600 mt-0.5" />
            ) : (
              <CheckCircle className="h-4 w-4 text-brand-600 mt-0.5" />
            )}
            <div>
              <p
                className={cn(
                  "text-[12px] font-medium",
                  pricePosition === "below"
                    ? "text-green-700"
                    : pricePosition === "above"
                      ? "text-amber-700"
                      : "text-brand-700"
                )}
              >
                {pricePosition === "below"
                  ? "Narx bozordan past — tezroq sotilishi mumkin"
                  : pricePosition === "above"
                    ? "Narx bozordan yuqori — savdolashuvga tayyor bo'ling"
                    : "Optimal narx — bozorga mos"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suggested prices buttons */}
      {onPriceSelect && (
        <div className="flex gap-2">
          <button
            onClick={() => onPriceSelect(advice.low)}
            className="flex-1 rounded-lg border border-green-200 bg-green-50 py-2 text-[12px] font-medium text-green-700 hover:bg-green-100"
          >
            Arzon: {formatPrice(advice.low, advice.currency)}
          </button>
          <button
            onClick={() => onPriceSelect(advice.fair)}
            className="flex-1 rounded-lg border border-brand-200 bg-brand-50 py-2 text-[12px] font-semibold text-brand-700 hover:bg-brand-100"
          >
            Optimal: {formatPrice(advice.fair, advice.currency)}
          </button>
          <button
            onClick={() => onPriceSelect(advice.high)}
            className="flex-1 rounded-lg border border-amber-200 bg-amber-50 py-2 text-[12px] font-medium text-amber-700 hover:bg-amber-100"
          >
            Premium: {formatPrice(advice.high, advice.currency)}
          </button>
        </div>
      )}

      {/* Expandable similar listings */}
      {advice.similarListings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-[12px] text-ink-600"
          >
            <span>O'xshash e'lonlar ({advice.similarListings.length})</span>
            <span>{expanded ? "Yopish" : "Ko'rish"}</span>
          </button>
          
          {expanded && (
            <div className="mt-3 space-y-2">
              {advice.similarListings.slice(0, 3).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-lg bg-white p-2 border border-border"
                >
                  <div>
                    <p className="text-[12px] font-medium text-ink-800 line-clamp-1">
                      {listing.title}
                    </p>
                    <p className="text-[11px] text-ink-500">
                      {listing.rooms} xona • {listing.area} m²
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-brand-600">
                    {formatPrice(listing.price, advice.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
