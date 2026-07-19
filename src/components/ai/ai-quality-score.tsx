"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Type,
  BarChart2,
  Search,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";

interface QualityBreakdown {
  title: number;
  description: number;
  images: number;
  pricing: number;
  completeness: number;
  seo: number;
}

interface QualityIssue {
  field: string;
  severity: "warning" | "error";
  message: string;
  suggestion: string;
}

interface QualityScore {
  overall: number;
  breakdown: QualityBreakdown;
  issues: QualityIssue[];
  seoKeywords: string[];
  estimatedVisibility: "low" | "medium" | "high";
}

interface Improvement {
  priority: number;
  action: string;
  impact: string;
}

interface AiQualityScoreProps {
  listing: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    dealType?: string;
    city?: string;
    district?: string;
    rooms?: number;
    area?: number;
    images?: string[];
    contactPhone?: string;
    contactTelegram?: string;
  };
  compact?: boolean;
  onImprove?: (field: string) => void;
}

const breakdownIcons: Record<keyof QualityBreakdown, typeof Type> = {
  title: Type,
  description: FileText,
  images: ImageIcon,
  pricing: DollarSign,
  completeness: BarChart2,
  seo: Search,
};

const breakdownLabels: Record<keyof QualityBreakdown, string> = {
  title: "Sarlavha",
  description: "Tavsif",
  images: "Rasmlar",
  pricing: "Narx",
  completeness: "To'liqlik",
  seo: "SEO",
};

export function AiQualityScore({ listing, compact = false, onImprove }: AiQualityScoreProps) {
  const [quality, setQuality] = useState<QualityScore | null>(null);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchQuality = async () => {
      if (!listing.title && !listing.description) return;
      
      setLoading(true);
      try {
        const res = await fetch("/api/ai/quality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing }),
        });
        const data = await res.json();
        
        if (data.quality) {
          setQuality(data.quality);
          setImprovements(data.improvements || []);
        }
      } catch (err) {
        console.error("Quality score error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchQuality, 500);
    return () => clearTimeout(debounce);
  }, [listing]);

  if (loading || !quality) {
    if (compact) return null;
    return (
      <div className="rounded-xl border border-border bg-ink-50 p-4">
        <div className="flex items-center gap-2 text-ink-500">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-[13px]">AI sifat tahlili...</span>
        </div>
      </div>
    );
  }

  const scoreColor =
    quality.overall >= 80
      ? "text-green-600"
      : quality.overall >= 50
        ? "text-amber-500"
        : "text-red-500";

  const scoreGradient =
    quality.overall >= 80
      ? "from-green-500 to-green-600"
      : quality.overall >= 50
        ? "from-amber-400 to-amber-500"
        : "from-red-400 to-red-500";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white text-[12px] font-bold",
            scoreGradient
          )}
        >
          {quality.overall}
        </div>
        <div>
          <p className="text-[12px] font-medium text-ink-700">
            Sifat balli
          </p>
          <p className="text-[11px] text-ink-500">
            {quality.estimatedVisibility === "high"
              ? "Yuqori ko'rinish"
              : quality.estimatedVisibility === "low"
                ? "Past ko'rinish"
                : "O'rtacha ko'rinish"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-border bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white text-[18px] font-bold",
              scoreGradient
            )}
          >
            {quality.overall}
          </div>
          <div>
            <h3 className="text-heading text-[15px] text-ink-900">AI Sifat Balli</h3>
            <p className="text-[12px] text-ink-500">
              {quality.estimatedVisibility === "high"
                ? "Yuqori ko'rinish kutilmoqda"
                : quality.estimatedVisibility === "low"
                  ? "Past ko'rinish kutilmoqda"
                  : "O'rtacha ko'rinish kutilmoqda"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-ink-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-600" />
          )}
        </button>
      </div>

      {/* Breakdown */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(quality.breakdown) as Array<keyof QualityBreakdown>).map((key) => {
            const Icon = breakdownIcons[key];
            const value = quality.breakdown[key];
            const color =
              value >= 80
                ? "text-green-600 bg-green-50"
                : value >= 50
                  ? "text-amber-600 bg-amber-50"
                  : "text-red-600 bg-red-50";

            return (
              <div
                key={key}
                className="flex flex-col items-center rounded-lg border border-border p-2"
              >
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="mt-1.5 text-[11px] text-ink-600">{breakdownLabels[key]}</span>
                <span className={cn("text-[13px] font-semibold", scoreColor)}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border"
        >
          {/* Issues */}
          {quality.issues.length > 0 && (
            <div className="p-4 border-b border-border">
              <h4 className="text-[13px] font-semibold text-ink-800 mb-3">
                Muammolar ({quality.issues.length})
              </h4>
              <div className="space-y-2">
                {quality.issues.slice(0, 5).map((issue, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg p-3",
                      issue.severity === "error"
                        ? "bg-red-50 border border-red-200"
                        : "bg-amber-50 border border-amber-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {issue.severity === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-[12px] font-medium",
                            issue.severity === "error" ? "text-red-700" : "text-amber-700"
                          )}
                        >
                          {issue.message}
                        </p>
                        <p className="text-[11px] text-ink-600 mt-0.5">{issue.suggestion}</p>
                        {onImprove && (
                          <button
                            onClick={() => onImprove(issue.field)}
                            className="mt-1.5 text-[11px] font-medium text-brand-600"
                          >
                            Tuzatish →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <div className="p-4 border-b border-border">
              <h4 className="text-[13px] font-semibold text-ink-800 mb-3">
                Tavsiyalar
              </h4>
              <div className="space-y-2">
                {improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-brand-50 border border-brand-200 p-3"
                  >
                    <CheckCircle className="h-4 w-4 text-brand-500 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-medium text-brand-800">{imp.action}</p>
                      <p className="text-[11px] text-brand-600">{imp.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Keywords */}
          {quality.seoKeywords.length > 0 && (
            <div className="p-4">
              <h4 className="text-[13px] font-semibold text-ink-800 mb-2">
                SEO kalit so'zlar
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {quality.seoKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] text-ink-700"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
