"use client";

import { motion } from "framer-motion";
import { Award, Eye, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InnerHeader } from "@/components/layout";
import { Badge, BottomSheet, Button, EmptyState, ErrorState, Loader } from "@/components/ui";
import { useSession, useToast } from "@/components/providers";
import { attachBackButton } from "@/lib/telegram-client";
import { formatPrice } from "@/lib/format";
import { CATEGORIES, CITIES, DISTRICTS } from "@/lib/constants";
import type { Property } from "@/types";

const statusLabel: Record<string, { label: string; variant: "default" | "vip" | "verified" | "new" | "rent" | "danger" }> = {
  pending: { label: "Kutilmoqda", variant: "default" },
  active: { label: "Faol", variant: "verified" },
  rejected: { label: "Rad etildi", variant: "danger" },
  archived: { label: "Arxivlangan", variant: "default" },
};

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "apartment",
    dealType: "sale",
    price: "",
    city: CITIES[0],
    district: DISTRICTS[0],
    rooms: "2",
    area: "60",
    description: "",
  });

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/seller/properties")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.properties ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!sessionLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading]);

  useEffect(() => attachBackButton(() => router.back()), [router]);

  const submit = async () => {
    if (!form.title || !form.price) {
      showToast("Sarlavha va narxni kiriting", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          rooms: Number(form.rooms),
          area: Number(form.area),
          images: ["/images/logo.png"],
        }),
      });
      if (res.ok) {
        showToast("E'lon yuborildi, moderatsiyadan keyin chiqadi", "success");
        setFormOpen(false);
        setForm({ ...form, title: "", price: "", description: "" });
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "Xatolik yuz berdi", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionLoading && user && !["seller", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen">
        <InnerHeader title="Sotuvchi paneli" />
        <EmptyState
          icon={<Award className="h-9 w-9" />}
          title="Ruxsat yo'q"
          message="Bu bo'lim faqat sotuvchilar uchun. Profilingizda sotuvchi bo'ling."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <InnerHeader title="Mening e'lonlarim" />

      <div className="space-y-4 px-4 py-4">
        {sessionLoading || loading ? (
          <Loader />
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-9 w-9" />}
            title="E'lonlar yo'q"
            message="Birinchi e'loningizni joylashtiring."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)} className="mt-1">
                E&apos;lon qo&apos;shish
              </Button>
            }
          />
        ) : (
          items.map((p, i) => {
            const status = statusLabel[p.status] ?? statusLabel.pending;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="flex gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.title} className="h-20 w-20 shrink-0 rounded-[var(--radius-md)] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[14px] font-bold text-ink-900">{p.title}</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] font-semibold text-brand-600">
                    {formatPrice(p.price, p.currency, p.dealType)}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-700/50">
                    <Eye className="h-3 w-3" /> {p.views} ko&apos;rish • {p.district}
                  </p>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="mt-1 text-[11.5px] text-error">Sabab: {p.rejectionReason}</p>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {!loading && !error && items.length > 0 && (
        <div className="safe-bottom fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4">
          <Button size="lg" className="w-full max-w-lg shadow-[var(--shadow-lift)]" onClick={() => setFormOpen(true)}>
            <Plus className="h-4.5 w-4.5" /> Yangi e&apos;lon qo&apos;shish
          </Button>
        </div>
      )}

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="Yangi e'lon">
        <div className="space-y-4 pt-1">
          <Field label="Sarlavha">
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              placeholder="Masalan: Yunusobodda 3 xonali kvartira"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Toifa">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bitim">
              <select
                value={form.dealType}
                onChange={(e) => setForm((f) => ({ ...f, dealType: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              >
                <option value="sale">Sotuv</option>
                <option value="rent">Ijara</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Narx ($)">
              <input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                type="number"
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              />
            </Field>
            <Field label="Maydon (m²)">
              <input
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                type="number"
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Shahar">
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tuman">
              <select
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Xonalar soni">
            <input
              value={form.rooms}
              onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
              type="number"
              className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
            />
          </Field>

          <Field label="Tavsif">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
            />
          </Field>

          <Button className="w-full" loading={submitting} onClick={submit}>
            E&apos;lonni yuborish
          </Button>
        </div>
      </BottomSheet>
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
