"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Castle,
  Check,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Key,
  Loader2,
  Map as MapIcon,
  Save,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapEmbed } from "@/components/property";
import { Button } from "@/components/ui";
import { useToast } from "@/components/providers";
import { MediaCenter } from "@/components/seller/media-center";
import { useBeforeUnloadWarning } from "@/hooks/useBeforeUnloadWarning";
import { useDraftAutosave, useRestoreDraft } from "@/hooks/useDraftAutosave";
import {
  AMENITIES_META,
  CATEGORIES,
  CITIES,
  DISTRICTS,
  FURNITURE_OPTIONS,
  HEATING_OPTIONS,
  PREFERRED_CONTACT_TIMES,
  RENT_PERIOD_OPTIONS,
  REPAIR_OPTIONS,
} from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { Property } from "@/types";

const categoryIcon: Record<string, typeof HomeIcon> = {
  apartment: Building2,
  house: HomeIcon,
  villa: Castle,
  office: Briefcase,
  land: MapIcon,
  rent: Key,
};

export interface WizardFormData {
  category: string;
  dealType: string;
  title: string;
  description: string;
  city: string;
  district: string;
  address: string;
  lat: string;
  lng: string;
  nearbyPlaces: string[];
  rooms: string;
  bathrooms: string;
  area: string;
  kitchenArea: string;
  floor: string;
  totalFloors: string;
  yearBuilt: string;
  heating: string;
  furniture: string;
  repairStatus: string;
  amenities: Record<string, boolean>;
  images: string[];
  price: string;
  currency: "USD" | "UZS";
  negotiable: boolean;
  installment: boolean;
  mortgage: boolean;
  rentPeriod: string;
  serviceFee: string;
  contactPhone: string;
  contactTelegram: string;
  hidePhone: boolean;
  preferredContactTime: string;
}

const EMPTY_FORM: WizardFormData = {
  category: "apartment",
  dealType: "sale",
  title: "",
  description: "",
  city: CITIES[0],
  district: DISTRICTS[0],
  address: "",
  lat: "",
  lng: "",
  nearbyPlaces: [],
  rooms: "2",
  bathrooms: "1",
  area: "60",
  kitchenArea: "",
  floor: "",
  totalFloors: "",
  yearBuilt: "",
  heating: "",
  furniture: "",
  repairStatus: "",
  amenities: {},
  images: [],
  price: "",
  currency: "USD",
  negotiable: false,
  installment: false,
  mortgage: false,
  rentPeriod: "monthly",
  serviceFee: "",
  contactPhone: "",
  contactTelegram: "",
  hidePhone: false,
  preferredContactTime: "anytime",
};

function propertyToForm(p: Property): WizardFormData {
  return {
    category: p.category,
    dealType: p.dealType,
    title: p.title,
    description: p.description,
    city: p.city,
    district: p.district,
    address: p.address ?? "",
    lat: p.lat != null ? String(p.lat) : "",
    lng: p.lng != null ? String(p.lng) : "",
    nearbyPlaces: p.nearbyPlaces ?? [],
    rooms: String(p.rooms),
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
    area: String(p.area),
    kitchenArea: p.kitchenArea != null ? String(p.kitchenArea) : "",
    floor: p.floor != null ? String(p.floor) : "",
    totalFloors: p.totalFloors != null ? String(p.totalFloors) : "",
    yearBuilt: p.yearBuilt != null ? String(p.yearBuilt) : "",
    heating: p.heating ?? "",
    furniture: p.furniture ?? "",
    repairStatus: p.repairStatus ?? "",
    amenities: (p.amenities as Record<string, boolean>) ?? {},
    images: p.images ?? [],
    price: String(p.price),
    currency: p.currency,
    negotiable: p.negotiable,
    installment: p.installment,
    mortgage: p.mortgage,
    rentPeriod: p.rentPeriod ?? "monthly",
    serviceFee: p.serviceFee != null ? String(p.serviceFee) : "",
    contactPhone: p.contactPhone ?? "",
    contactTelegram: p.contactTelegram ?? "",
    hidePhone: p.hidePhone,
    preferredContactTime: p.preferredContactTime ?? "anytime",
  };
}

const STEP_LABELS = ["Turi", "Manzil", "Xususiyatlar", "Media", "Narx", "Aloqa"];

export function ListingWizard({
  mode,
  initialProperty,
}: {
  mode: "create" | "edit";
  initialProperty?: Property;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(initialProperty ? propertyToForm(initialProperty) : EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [restoredOnce, setRestoredOnce] = useState(mode === "edit");
  const [dirty, setDirty] = useState(false);

  const restoredDraft = useRestoreDraft();
  const draft = mode === "create" ? restoredDraft : undefined;
  const { status: autosaveStatus } = useDraftAutosave(step, form as unknown as Record<string, unknown>, mode === "create" && dirty);
  useBeforeUnloadWarning(dirty && mode === "create");

  useEffect(() => {
    if (mode !== "create" || restoredOnce) return;
    if (draft === undefined) return; // still loading
    if (draft && draft.data && Object.keys(draft.data).length > 0) {
      setForm((f) => ({ ...f, ...(draft.data as Partial<WizardFormData>) }));
      setStep(draft.step || 1);
      showToast("Saqlangan qoralama tiklandi", "info");
    }
    setRestoredOnce(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, mode, restoredOnce]);

  const update = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(form.category && form.dealType);
    if (step === 2) return Boolean(form.city && form.district);
    if (step === 3) return Number(form.area) > 0;
    if (step === 4) return form.images.length > 0;
    if (step === 5) return Number(form.price) > 0;
    return true;
  }, [step, form]);

  const runAiAssist = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          dealType: form.dealType,
          city: form.city,
          district: form.district,
          rooms: Number(form.rooms),
          area: Number(form.area),
          amenities: Object.keys(form.amenities).filter((k) => form.amenities[k]),
        }),
      });
      const data = await res.json();
      if (data.title) update("title", data.title);
      if (data.description) update("description", data.description);
      showToast("AI tavsiyalari qo'llandi", "success");
    } catch {
      showToast("AI xizmati vaqtincha mavjud emas", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const buildPayload = (asDraft: boolean) => ({
    title: form.title || "Sarlavhasiz e'lon",
    description: form.description,
    category: form.category,
    dealType: form.dealType,
    price: Number(form.price || 0),
    currency: form.currency,
    city: form.city,
    district: form.district,
    address: form.address || null,
    lat: form.lat ? Number(form.lat) : null,
    lng: form.lng ? Number(form.lng) : null,
    nearbyPlaces: form.nearbyPlaces,
    rooms: Number(form.rooms || 0),
    area: Number(form.area || 0),
    floor: form.floor ? Number(form.floor) : null,
    totalFloors: form.totalFloors ? Number(form.totalFloors) : null,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
    kitchenArea: form.kitchenArea ? Number(form.kitchenArea) : null,
    yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : null,
    heating: form.heating || null,
    furniture: form.furniture || null,
    repairStatus: form.repairStatus || null,
    amenities: form.amenities,
    negotiable: form.negotiable,
    installment: form.installment,
    mortgage: form.mortgage,
    rentPeriod: form.dealType === "rent" ? form.rentPeriod : null,
    serviceFee: form.serviceFee ? Number(form.serviceFee) : null,
    contactPhone: form.contactPhone || null,
    contactTelegram: form.contactTelegram || null,
    hidePhone: form.hidePhone,
    preferredContactTime: form.preferredContactTime,
    images: form.images,
    asDraft,
  });

  const submit = async (asDraft: boolean) => {
    if (!asDraft) {
      if (!form.title || form.title.trim().length < 5) {
        showToast("Sarlavha kamida 5 belgidan iborat bo'lishi kerak", "error");
        setStep(6);
        return;
      }
      if (!form.price || Number(form.price) <= 0) {
        showToast("Narxni to'g'ri kiriting", "error");
        setStep(5);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(asDraft);
      const res =
        mode === "edit" && initialProperty
          ? await fetch(`/api/properties/${initialProperty.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch("/api/properties", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      if (res.ok) {
        if (mode === "create") {
          await fetch("/api/seller/drafts", { method: "DELETE" }).catch(() => {});
        }
        setDirty(false);
        showToast(
          asDraft ? "Qoralama sifatida saqlandi" : mode === "edit" ? "E'lon yangilandi" : "E'lon yuborildi, moderatsiyadan keyin chiqadi",
          "success"
        );
        router.push("/seller/listings");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Xatolik yuz berdi", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-32">
      {/* Step progress */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-1.5">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                    done ? "bg-brand-500 text-white" : active ? "bg-brand-100 text-brand-600 ring-2 ring-brand-400" : "bg-black/[0.05] text-ink-700/40"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={cn("text-[9.5px] font-semibold", active ? "text-brand-600" : "text-ink-700/40")}>{label}</span>
              </div>
            );
          })}
        </div>
        {mode === "create" && (
          <p className="mt-2 text-center text-[11px] text-ink-700/40">
            {autosaveStatus === "saving" && "Saqlanmoqda..."}
            {autosaveStatus === "saved" && <span className="flex items-center justify-center gap-1"><Save className="h-3 w-3" /> Qoralama saqlandi</span>}
            {autosaveStatus === "error" && "Saqlashda xatolik"}
          </p>
        )}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-4 px-4 pt-5">
        {step === 1 && (
          <div className="space-y-5">
            <Field label="Mulk turi">
              <div className="grid grid-cols-3 gap-2.5">
                {CATEGORIES.map((c) => {
                  const Icon = categoryIcon[c.id] ?? HomeIcon;
                  const active = form.category === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => update("category", c.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border p-3 transition-colors",
                        active ? "border-brand-500 bg-brand-50 text-brand-600" : "border-border bg-white text-ink-700/70"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-[11.5px] font-semibold">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Bitim turi">
              <div className="grid grid-cols-2 gap-2.5">
                {[{ id: "sale", label: "Sotuv" }, { id: "rent", label: "Ijara" }].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => update("dealType", d.id)}
                    className={cn(
                      "rounded-[var(--radius-md)] border p-3 text-[13.5px] font-bold transition-colors",
                      form.dealType === d.id ? "border-brand-500 bg-brand-50 text-brand-600" : "border-border bg-white text-ink-700/70"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Shahar">
                <Select value={form.city} onChange={(v) => update("city", v)} options={CITIES.map((c) => ({ id: c, label: c }))} />
              </Field>
              <Field label="Tuman">
                <Select value={form.district} onChange={(v) => update("district", v)} options={DISTRICTS.map((d) => ({ id: d, label: d }))} />
              </Field>
            </div>
            <Field label="Ko'cha / manzil">
              <Input value={form.address} onChange={(v) => update("address", v)} placeholder="Ko'cha, uy raqami" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kenglik (lat)">
                <Input value={form.lat} onChange={(v) => update("lat", v)} type="number" placeholder="41.31" />
              </Field>
              <Field label="Uzunlik (lng)">
                <Input value={form.lng} onChange={(v) => update("lng", v)} type="number" placeholder="69.24" />
              </Field>
            </div>
            <MapEmbed lat={form.lat ? Number(form.lat) : null} lng={form.lng ? Number(form.lng) : null} label="Xarita bo'yicha tanlash" />
            <Field label="Yaqin atrofdagi joylar (vergul bilan)">
              <Input
                value={form.nearbyPlaces.join(", ")}
                onChange={(v) => update("nearbyPlaces", v.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="Metro, maktab, bozor..."
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Xonalar soni"><Input value={form.rooms} onChange={(v) => update("rooms", v)} type="number" /></Field>
              <Field label="Hammomlar soni"><Input value={form.bathrooms} onChange={(v) => update("bathrooms", v)} type="number" /></Field>
              <Field label="Maydon (m²)"><Input value={form.area} onChange={(v) => update("area", v)} type="number" /></Field>
              <Field label="Oshxona (m²)"><Input value={form.kitchenArea} onChange={(v) => update("kitchenArea", v)} type="number" /></Field>
              <Field label="Qavat"><Input value={form.floor} onChange={(v) => update("floor", v)} type="number" /></Field>
              <Field label="Jami qavatlar"><Input value={form.totalFloors} onChange={(v) => update("totalFloors", v)} type="number" /></Field>
              <Field label="Qurilgan yili"><Input value={form.yearBuilt} onChange={(v) => update("yearBuilt", v)} type="number" /></Field>
              <Field label="Ta'mirlash holati">
                <Select value={form.repairStatus} onChange={(v) => update("repairStatus", v)} options={REPAIR_OPTIONS} placeholder="Tanlang" />
              </Field>
              <Field label="Isitish tizimi">
                <Select value={form.heating} onChange={(v) => update("heating", v)} options={HEATING_OPTIONS} placeholder="Tanlang" />
              </Field>
              <Field label="Mebel">
                <Select value={form.furniture} onChange={(v) => update("furniture", v)} options={FURNITURE_OPTIONS} placeholder="Tanlang" />
              </Field>
            </div>
            <Field label="Qulayliklar">
              <div className="flex flex-wrap gap-2">
                {Object.entries(AMENITIES_META).map(([key, meta]) => {
                  const active = Boolean(form.amenities[key]);
                  return (
                    <button
                      key={key}
                      onClick={() => update("amenities", { ...form.amenities, [key]: !active })}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
                        active ? "border-brand-500 bg-brand-500 text-white" : "border-border bg-white text-ink-700/70"
                      )}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        )}

        {step === 4 && <MediaCenter images={form.images} onChange={(imgs) => update("images", imgs)} />}

        {step === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Narx (${form.currency})`}><Input value={form.price} onChange={(v) => update("price", v)} type="number" /></Field>
              <Field label="Valyuta">
                <Select value={form.currency} onChange={(v) => update("currency", v as "USD" | "UZS")} options={[{ id: "USD", label: "USD" }, { id: "UZS", label: "UZS" }]} />
              </Field>
            </div>
            {form.dealType === "rent" && (
              <Field label="Ijara davri">
                <Select value={form.rentPeriod} onChange={(v) => update("rentPeriod", v)} options={RENT_PERIOD_OPTIONS} />
              </Field>
            )}
            <Field label="Xizmat haqi (ixtiyoriy)"><Input value={form.serviceFee} onChange={(v) => update("serviceFee", v)} type="number" /></Field>
            <div className="flex flex-wrap gap-2">
              <Toggle label="Kelishiladi" active={form.negotiable} onClick={() => update("negotiable", !form.negotiable)} />
              <Toggle label="Bo'lib to'lash" active={form.installment} onClick={() => update("installment", !form.installment)} />
              <Toggle label="Ipoteka" active={form.mortgage} onClick={() => update("mortgage", !form.mortgage)} />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-brand-100 bg-brand-50/60 p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-brand-600">
                  <Sparkles className="h-3.5 w-3.5" /> AI Assist — sarlavha va tavsif
                </p>
                <Button size="sm" variant="secondary" loading={aiLoading} onClick={runAiAssist}>
                  Yaratish
                </Button>
              </div>
            </div>
            <Field label="Sarlavha"><Input value={form.title} onChange={(v) => update("title", v)} placeholder="Masalan: Yunusobodda 3 xonali kvartira" /></Field>
            <Field label="Tavsif">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Telefon (ixtiyoriy)"><Input value={form.contactPhone} onChange={(v) => update("contactPhone", v)} placeholder="+998..." /></Field>
              <Field label="Telegram (ixtiyoriy)"><Input value={form.contactTelegram} onChange={(v) => update("contactTelegram", v)} placeholder="username" /></Field>
            </div>
            <Field label="Qulay aloqa vaqti">
              <Select value={form.preferredContactTime} onChange={(v) => update("preferredContactTime", v)} options={PREFERRED_CONTACT_TIMES} />
            </Field>
            <Toggle label="Telefon raqamini yashirish" active={form.hidePhone} onClick={() => update("hidePhone", !form.hidePhone)} />
          </div>
        )}
      </motion.div>

      {/* Bottom nav */}
      <div className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex justify-center border-t border-border/70 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex w-full max-w-lg items-center gap-2.5">
          {step > 1 && (
            <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="h-4.5 w-4.5" />
            </Button>
          )}
          {step === 1 && mode === "create" && (
            <Button variant="outline" size="lg" loading={submitting} onClick={() => submit(true)}>
              Qoralama
            </Button>
          )}
          {step < 6 ? (
            <Button size="lg" className="flex-1" disabled={!canGoNext} onClick={() => setStep((s) => s + 1)}>
              Keyingisi <ChevronRight className="h-4.5 w-4.5" />
            </Button>
          ) : (
            <Button size="lg" className="flex-1" loading={submitting} onClick={() => submit(false)}>
              {submitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : mode === "edit" ? "Saqlash" : "E'lonni yuborish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12.5px] font-semibold text-ink-700/60">{label}</p>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[var(--radius-md)] border border-border bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
        active ? "border-brand-500 bg-brand-500 text-white" : "border-border bg-white text-ink-700/70"
      )}
    >
      {label}
    </button>
  );
}
