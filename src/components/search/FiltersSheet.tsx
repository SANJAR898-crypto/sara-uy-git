"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useRegions } from "@/hooks/useReferenceData";
import { PROPERTY_TYPE_LABELS, DEAL_TYPE_LABELS } from "@/lib/format";
import type { ListingsFilters } from "@/hooks/useListings";
import { cn } from "@/lib/cn";

interface FiltersSheetProps {
  open: boolean;
  onClose: () => void;
  filters: ListingsFilters;
  onApply: (filters: ListingsFilters) => void;
}

export function FiltersSheet({ open, onClose, filters, onApply }: FiltersSheetProps) {
  const [draft, setDraft] = useState<ListingsFilters>(filters);
  const { data } = useRegions();
  const regions = data?.regions ?? [];
  const selectedRegion = regions.find((r) => r.id === draft.regionId);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[120] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 safe-bottom"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink-900">Filtrlar</h3>
              <button onClick={onClose} className="rounded-full bg-ink-100 p-2">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-bold text-ink-700">Bitim turi</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DEAL_TYPE_LABELS).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() =>
                        setDraft((d) => ({ ...d, dealType: d.dealType === code ? undefined : code }))
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                        draft.dealType === code
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-ink-200 text-ink-600",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-ink-700">Mulk turi</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() =>
                        setDraft((d) => ({ ...d, propertyType: d.propertyType === code ? undefined : code }))
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                        draft.propertyType === code
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-ink-200 text-ink-600",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-ink-700">Hudud</p>
                <select
                  value={draft.regionId ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, regionId: e.target.value || undefined, districtId: undefined }))
                  }
                  className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm"
                >
                  <option value="">Barcha hududlar</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRegion && selectedRegion.districts.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-bold text-ink-700">Tuman</p>
                  <select
                    value={draft.districtId ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, districtId: e.target.value || undefined }))}
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Barcha tumanlar</option>
                    {selectedRegion.districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.nameUz}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-bold text-ink-700">Xonalar soni</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setDraft((d) => ({ ...d, rooms: d.rooms === n ? undefined : n }))}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold",
                        draft.rooms === n
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-ink-200 text-ink-600",
                      )}
                    >
                      {n === 5 ? "5+" : n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-ink-700">Narx oralig&apos;i (so&apos;m)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Dan"
                    value={draft.minPrice ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, minPrice: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm"
                  />
                  <span className="text-ink-400">—</span>
                  <input
                    type="number"
                    placeholder="Gacha"
                    value={draft.maxPrice ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, maxPrice: e.target.value ? Number(e.target.value) : undefined }))
                    }
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setDraft({});
                  onApply({});
                  onClose();
                }}
                className="flex-1 rounded-2xl border border-ink-200 py-3.5 text-sm font-bold text-ink-600"
              >
                Tozalash
              </button>
              <button
                onClick={() => {
                  onApply(draft);
                  onClose();
                }}
                className="flex-[2] rounded-2xl bg-brand-500 py-3.5 text-sm font-bold text-white active:scale-95"
              >
                Natijalarni ko&apos;rsatish
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
