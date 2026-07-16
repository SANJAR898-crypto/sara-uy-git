"use client";

import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Check,
  Eye,
  Image as ImageIcon,
  Layers,
  Plus,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InnerHeader } from "@/components/layout";
import { Badge, BottomSheet, Button, EmptyState, ErrorState, Loader } from "@/components/ui";
import { useSession, useToast } from "@/components/providers";
import { attachBackButton } from "@/lib/telegram-client";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Property, UserRole } from "@/types";

interface AdminUserRow {
  id: string;
  telegramId: number;
  name: string;
  username: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

interface AdminStats {
  users: { total: number; sellers: number; admins: number; verified: number };
  properties: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    archived: number;
    vip: number;
    views: number;
  };
  favorites: { total: number };
  notifications: { total: number };
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byCity: { city: string; count: number }[];
}

interface AdminStory {
  id: string;
  name: string;
  avatar: string;
  image: string;
  isVip: boolean;
}

const TABS = [
  { id: "overview", label: "Umumiy", icon: BarChart3 },
  { id: "properties", label: "E'lonlar", icon: Layers },
  { id: "users", label: "Foydalanuvchilar", icon: UsersIcon },
  { id: "stories", label: "Stories", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => attachBackButton(() => router.back()), [router]);

  if (!sessionLoading && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen">
        <InnerHeader title="Admin panel" />
        <EmptyState
          icon={<ShieldX className="h-9 w-9" />}
          title="Ruxsat yo'q"
          message="Bu bo'lim faqat administratorlar uchun mavjud."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <InnerHeader title="Admin panel" />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors",
                active
                  ? "border-brand-500 bg-brand-500 text-white shadow-[var(--shadow-brand)]"
                  : "border-border bg-white text-ink-700/70"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {sessionLoading ? (
        <Loader className="pt-10" />
      ) : (
        <>
          {tab === "overview" && <OverviewTab />}
          {tab === "properties" && <PropertiesTab />}
          {tab === "users" && <UsersTab />}
          {tab === "stories" && <StoriesTab />}
        </>
      )}
    </div>
  );
}

/* ============================================================
   Overview / Analytics
   ============================================================ */
function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader className="pt-10" />;
  if (error || !stats) return <ErrorState onRetry={load} />;

  const maxCity = Math.max(1, ...stats.byCity.map((c) => c.count));

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Jami foydalanuvchilar" value={stats.users.total} icon={<UsersIcon className="h-4.5 w-4.5" />} />
        <StatCard label="Sotuvchilar" value={stats.users.sellers} icon={<Award className="h-4.5 w-4.5" />} />
        <StatCard label="Jami e'lonlar" value={stats.properties.total} icon={<Layers className="h-4.5 w-4.5" />} />
        <StatCard label="Faol e'lonlar" value={stats.properties.active} icon={<Check className="h-4.5 w-4.5" />} />
        <StatCard label="Kutilmoqda" value={stats.properties.pending} icon={<ShieldCheck className="h-4.5 w-4.5" />} />
        <StatCard label="VIP e'lonlar" value={stats.properties.vip} icon={<Star className="h-4.5 w-4.5" />} />
        <StatCard label="Jami ko'rishlar" value={stats.properties.views} icon={<Eye className="h-4.5 w-4.5" />} />
        <StatCard label="Sevimlilar" value={stats.favorites.total} icon={<Sparkles className="h-4.5 w-4.5" />} />
      </div>

      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">Toifalar bo&apos;yicha</h3>
        <div className="space-y-2 rounded-[var(--radius-lg)] border border-border bg-white p-4">
          {stats.byCategory.map((c) => (
            <div key={c.category} className="flex items-center justify-between text-[13px]">
              <span className="capitalize text-ink-700/70">{c.category}</span>
              <span className="font-bold text-ink-900">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">Top shaharlar</h3>
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-4">
          {stats.byCity.map((c) => (
            <div key={c.city}>
              <div className="mb-1 flex items-center justify-between text-[12.5px] font-semibold text-ink-800">
                <span>{c.city}</span>
                <span>{c.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.05]">
                <motion.div
                  className="h-full rounded-full bg-brand-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.count / maxCity) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-white p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-2.5 text-[19px] font-bold text-ink-900">{value.toLocaleString()}</p>
      <p className="text-[11.5px] text-ink-700/50">{label}</p>
    </div>
  );
}

/* ============================================================
   Properties moderation
   ============================================================ */
const statusFilters = [
  { id: "all", label: "Barchasi" },
  { id: "pending", label: "Kutilmoqda" },
  { id: "active", label: "Faol" },
  { id: "rejected", label: "Rad etilgan" },
  { id: "archived", label: "Arxiv" },
] as const;

function PropertiesTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]["id"]>("pending");
  const [rejectTarget, setRejectTarget] = useState<Property | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [verifyResults, setVerifyResults] = useState<Record<string, { verified: boolean; confidence: number; notes: string[] }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = (status = statusFilter) => {
    setLoading(true);
    setError(false);
    fetch(`/api/admin/properties?status=${status}`)
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.properties ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateProperty = async (id: string, patch: Record<string, unknown>, successMsg: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        showToast(successMsg, "success");
        load(statusFilter);
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  const runAiVerify = async (property: Property) => {
    setBusyId(property.id);
    try {
      const res = await fetch("/api/ai/verify-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: property.images }),
      });
      const data = await res.json();
      setVerifyResults((prev) => ({ ...prev, [property.id]: data }));
      showToast(
        data.verified ? `AI: rasm sifati yaxshi (${data.confidence}%)` : `AI: rasm sifati shubhali (${data.confidence}%)`,
        data.verified ? "success" : "info"
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              statusFilter === s.id ? "border-brand-500 bg-brand-50 text-brand-600" : "border-border bg-white text-ink-700/60"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState onRetry={() => load(statusFilter)} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Layers className="h-9 w-9" />} title="E'lonlar yo'q" message="Bu filtr bo'yicha e'lon topilmadi." />
      ) : (
        items.map((p) => {
          const verify = verifyResults[p.id];
          const busy = busyId === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-3.5"
            >
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.title} className="h-20 w-20 shrink-0 rounded-[var(--radius-md)] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[14px] font-bold text-ink-900">{p.title}</p>
                    <Badge variant={p.status === "active" ? "verified" : p.status === "rejected" ? "danger" : "default"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] font-semibold text-brand-600">{formatPrice(p.price, p.currency, p.dealType)}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-700/50">
                    {p.district}, {p.city} • {p.seller.name}
                  </p>
                </div>
              </div>

              {verify && (
                <div
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-2 text-[11.5px]",
                    verify.verified ? "bg-emerald-50 text-emerald-700" : "bg-warning-bg text-warning"
                  )}
                >
                  AI ishonch darajasi: {verify.confidence}% — {verify.notes.join("; ")}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {p.status !== "active" && (
                  <Button size="sm" loading={busy} onClick={() => updateProperty(p.id, { status: "active" }, "E'lon tasdiqlandi")}>
                    <Check className="h-3.5 w-3.5" /> Tasdiqlash
                  </Button>
                )}
                {p.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    onClick={() => {
                      setRejectTarget(p);
                      setRejectReason("");
                    }}
                  >
                    <X className="h-3.5 w-3.5" /> Rad etish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={p.isVip ? "secondary" : "outline"}
                  loading={busy}
                  onClick={() => updateProperty(p.id, { isVip: !p.isVip }, p.isVip ? "VIP olib tashlandi" : "VIP belgilandi")}
                >
                  <Star className="h-3.5 w-3.5" /> {p.isVip ? "VIP olib tashlash" : "VIP qilish"}
                </Button>
                <Button
                  size="sm"
                  variant={p.isVerified ? "secondary" : "outline"}
                  loading={busy}
                  onClick={() => updateProperty(p.id, { isVerified: !p.isVerified }, "Tasdiqlangan holat yangilandi")}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> {p.isVerified ? "Tasdiqni olib tashlash" : "Tasdiqlash belgisi"}
                </Button>
                <Button size="sm" variant="ghost" loading={busy} onClick={() => runAiVerify(p)}>
                  <ImageIcon className="h-3.5 w-3.5" /> AI rasm tekshiruvi
                </Button>
              </div>
            </motion.div>
          );
        })
      )}

      <BottomSheet open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="E'lonni rad etish">
        <div className="space-y-4 pt-1">
          <p className="text-[13.5px] text-ink-700/60">
            &quot;{rejectTarget?.title}&quot; e&apos;loni rad etilmoqda. Sababni kiriting — sotuvchiga xabar yuboriladi.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Masalan: rasm sifati past, ma'lumot to'liq emas..."
            className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
          />
          <Button
            variant="danger"
            className="w-full"
            onClick={async () => {
              if (!rejectTarget) return;
              await updateProperty(rejectTarget.id, { status: "rejected", rejectionReason: rejectReason }, "E'lon rad etildi");
              setRejectTarget(null);
            }}
          >
            Rad etishni tasdiqlash
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ============================================================
   Users management
   ============================================================ */
function UsersTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.users ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const patchUser = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), ...patch }),
      });
      if (res.ok) {
        showToast("Foydalanuvchi yangilandi", "success");
        load();
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader className="pt-10 px-4" />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="space-y-3 px-4 pb-6">
      {items.length === 0 ? (
        <EmptyState icon={<UsersIcon className="h-9 w-9" />} title="Foydalanuvchilar yo'q" />
      ) : (
        items.map((u) => (
          <div key={u.id} className="rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-ink-900">{u.name}</p>
                <p className="text-[12px] text-ink-700/50">{u.username ? `@${u.username}` : `ID: ${u.telegramId}`}</p>
              </div>
              <Badge variant={u.role === "admin" ? "vip" : u.role === "seller" ? "verified" : "default"}>{u.role}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["user", "seller", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  disabled={busyId === u.id || u.role === r}
                  onClick={() => patchUser(u.id, { role: r })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors disabled:opacity-40",
                    u.role === r ? "border-brand-500 bg-brand-500 text-white" : "border-border bg-white text-ink-700/70"
                  )}
                >
                  {r}
                </button>
              ))}
              <button
                disabled={busyId === u.id}
                onClick={() => patchUser(u.id, { isVerified: !u.isVerified })}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                  u.isVerified ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border bg-white text-ink-700/70"
                )}
              >
                <ShieldCheck className="h-3 w-3" /> {u.isVerified ? "Tasdiqlangan" : "Tasdiqlash"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ============================================================
   Stories management
   ============================================================ */
function StoriesTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", avatarUrl: "", imageUrl: "", isVip: false });

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/stories")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.stories ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!form.name || !form.avatarUrl || !form.imageUrl) {
      showToast("Barcha maydonlarni to'ldiring", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Story qo'shildi", "success");
        setFormOpen(false);
        setForm({ name: "", avatarUrl: "", imageUrl: "", isVip: false });
        load();
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/stories?id=${id}`, { method: "DELETE" });
    showToast("Story o'chirildi", "info");
    load();
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      <Button size="sm" onClick={() => setFormOpen(true)}>
        <Plus className="h-4 w-4" /> Yangi story
      </Button>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Sparkles className="h-9 w-9" />} title="Stories yo'q" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.name} className="h-28 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-ink-900">{s.name}</p>
                  {s.isVip && <Badge variant="vip" className="mt-1">VIP</Badge>}
                </div>
                <button onClick={() => remove(s.id)} className="rounded-full p-1.5 text-error hover:bg-error-bg">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={formOpen} onClose={() => setFormOpen(false)} title="Yangi story">
        <div className="space-y-4 pt-1">
          <Field label="Nomi">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
            />
          </Field>
          <Field label="Avatar URL">
            <input
              value={form.avatarUrl}
              onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              placeholder="https://..."
            />
          </Field>
          <Field label="Rasm URL">
            <input
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              placeholder="https://..."
            />
          </Field>
          <label className="flex items-center gap-2 text-[13.5px] font-medium text-ink-800">
            <input
              type="checkbox"
              checked={form.isVip}
              onChange={(e) => setForm((f) => ({ ...f, isVip: e.target.checked }))}
              className="h-4 w-4 accent-brand-500"
            />
            VIP story (oltin halqa)
          </label>
          <Button className="w-full" loading={submitting} onClick={submit}>
            Qo&apos;shish
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
