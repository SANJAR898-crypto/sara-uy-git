"use client";

import { motion } from "framer-motion";
import {
  AlertOctagon,
  Award,
  BarChart3,
  Bell,
  Check,
  CreditCard,
  Eye,
  Flag,
  Image as ImageIcon,
  Layers,
  Plus,
  ScrollText,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
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
  { id: "reports", label: "Shikoyatlar", icon: Flag },
  { id: "payments", label: "To'lovlar", icon: CreditCard },
  { id: "notifications", label: "Xabarnomalar", icon: Bell },
  { id: "flags", label: "Feature Flags", icon: ToggleRight },
  { id: "settings", label: "Sozlamalar", icon: SettingsIcon },
  { id: "logs", label: "Audit Trail", icon: ScrollText },
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
          {tab === "reports" && <ReportsTab />}
          {tab === "payments" && <PaymentsTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "flags" && <FeatureFlagsTab />}
          {tab === "settings" && <SettingsTab />}
          {tab === "logs" && <AuditLogsTab />}
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

/* ============================================================
   REPORTS  (content / user moderation queue)
   ============================================================ */
interface AdminReport {
  id: string;
  reporterName: string | null;
  targetType: string;
  targetId: number;
  reason: string;
  details: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
}

const reportStatusFilters = [
  { id: "all", label: "Barchasi" },
  { id: "open", label: "Ochiq" },
  { id: "reviewing", label: "Ko'rib chiqilmoqda" },
  { id: "resolved", label: "Hal qilingan" },
  { id: "dismissed", label: "Rad etilgan" },
] as const;

function ReportsTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof reportStatusFilters)[number]["id"]>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = (status = statusFilter) => {
    setLoading(true);
    setError(false);
    fetch(`/api/admin/reports?status=${status}`)
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.reports ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status }),
      });
      if (res.ok) {
        showToast("Shikoyat holati yangilandi", "success");
        load(statusFilter);
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {reportStatusFilters.map((s) => (
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
        <EmptyState icon={<Flag className="h-9 w-9" />} title="Shikoyatlar yo'q" message="Bu filtr bo'yicha shikoyat topilmadi." />
      ) : (
        items.map((r) => (
          <div key={r.id} className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-ink-900">
                  {r.targetType === "property" ? "E'lon" : "Foydalanuvchi"} #{r.targetId}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-700/50">Shikoyatchi: {r.reporterName ?? "Noma'lum"}</p>
              </div>
              <Badge
                variant={
                  r.status === "resolved" ? "verified" : r.status === "dismissed" ? "default" : r.status === "reviewing" ? "rent" : "danger"
                }
              >
                {r.status}
              </Badge>
            </div>
            <p className="text-[13px] font-semibold text-ink-800">{r.reason}</p>
            {r.details && <p className="text-[12.5px] text-ink-700/60">{r.details}</p>}
            <div className="flex flex-wrap gap-2">
              {r.status !== "reviewing" && (
                <Button size="sm" variant="outline" loading={busyId === r.id} onClick={() => updateStatus(r.id, "reviewing")}>
                  Ko&apos;rib chiqish
                </Button>
              )}
              {r.status !== "resolved" && (
                <Button size="sm" loading={busyId === r.id} onClick={() => updateStatus(r.id, "resolved")}>
                  <Check className="h-3.5 w-3.5" /> Hal qilish
                </Button>
              )}
              {r.status !== "dismissed" && (
                <Button size="sm" variant="ghost" loading={busyId === r.id} onClick={() => updateStatus(r.id, "dismissed")}>
                  <X className="h-3.5 w-3.5" /> Rad etish
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ============================================================
   PAYMENTS  (subscription revenue ledger)
   ============================================================ */
interface AdminPayment {
  id: string;
  sellerName: string | null;
  sellerId: string;
  planKey: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  method: string;
  note: string | null;
  createdAt: string;
}

function PaymentsTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [summary, setSummary] = useState<{ totalRevenue: number; pendingCount: number; paidCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/payments")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => {
        setItems(data.payments ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), status }),
      });
      if (res.ok) {
        showToast("To'lov holati yangilandi", "success");
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
    <div className="space-y-4 px-4 pb-6">
      {summary && (
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Jami daromad" value={Math.round(summary.totalRevenue)} icon={<CreditCard className="h-4.5 w-4.5" />} />
          <StatCard label="Kutilmoqda" value={summary.pendingCount} icon={<AlertOctagon className="h-4.5 w-4.5" />} />
          <StatCard label="To'langan" value={summary.paidCount} icon={<Check className="h-4.5 w-4.5" />} />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={<CreditCard className="h-9 w-9" />} title="To'lovlar yo'q" />
      ) : (
        items.map((p) => (
          <div key={p.id} className="space-y-2.5 rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-ink-900">{p.sellerName ?? "Noma'lum"}</p>
                <p className="text-[12px] uppercase text-ink-700/50">{p.planKey} • {p.method}</p>
              </div>
              <Badge variant={p.status === "paid" ? "verified" : p.status === "failed" || p.status === "refunded" ? "danger" : "default"}>
                {p.status}
              </Badge>
            </div>
            <p className="text-[15px] font-bold text-brand-600">
              {p.amount.toLocaleString()} {p.currency}
            </p>
            {p.note && <p className="text-[12px] text-ink-700/50">{p.note}</p>}
            <div className="flex flex-wrap gap-2">
              {p.status !== "paid" && (
                <Button size="sm" loading={busyId === p.id} onClick={() => updateStatus(p.id, "paid")}>
                  <Check className="h-3.5 w-3.5" /> To&apos;langan deb belgilash
                </Button>
              )}
              {p.status !== "failed" && p.status !== "paid" && (
                <Button size="sm" variant="danger" loading={busyId === p.id} onClick={() => updateStatus(p.id, "failed")}>
                  <X className="h-3.5 w-3.5" /> Muvaffaqiyatsiz
                </Button>
              )}
              {p.status === "paid" && (
                <Button size="sm" variant="ghost" loading={busyId === p.id} onClick={() => updateStatus(p.id, "refunded")}>
                  Qaytarish
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ============================================================
   NOTIFICATION CENTER  (broadcast)
   ============================================================ */
function NotificationsTab() {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "sellers" | "users">("all");
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<{ id: string; title: string; message: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/notifications")
      .then((r) => (r.ok ? r.json() : { broadcasts: [] }))
      .then((data) => setBroadcasts(data.broadcasts ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const send = async () => {
    if (!title || !message) {
      showToast("Sarlavha va matnni kiriting", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, audience, type: "system" }),
      });
      if (res.ok) {
        showToast("Xabarnoma yuborildi", "success");
        setTitle("");
        setMessage("");
        load();
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-4">
        <h3 className="text-heading text-[15px] text-ink-900">Yangi xabarnoma yuborish</h3>
        <Field label="Auditoriya">
          <div className="flex gap-2">
            {(["all", "sellers", "users"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
                  audience === a ? "border-brand-500 bg-brand-500 text-white" : "border-border bg-white text-ink-700/60"
                )}
              >
                {a === "all" ? "Barchaga" : a === "sellers" ? "Sotuvchilarga" : "Foydalanuvchilarga"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Sarlavha">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
            placeholder="Masalan: Yangi funksiya!"
          />
        </Field>
        <Field label="Matn">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
            placeholder="Xabar matni..."
          />
        </Field>
        <Button className="w-full" loading={sending} onClick={send}>
          <Send className="h-4 w-4" /> Yuborish
        </Button>
      </div>

      <div>
        <h3 className="text-heading mb-3 text-[15px] text-ink-900">So&apos;nggi xabarnomalar</h3>
        {loading ? (
          <Loader />
        ) : broadcasts.length === 0 ? (
          <EmptyState icon={<Bell className="h-9 w-9" />} title="Xabarnomalar yo'q" />
        ) : (
          <div className="space-y-2.5">
            {broadcasts.map((b) => (
              <div key={b.id} className="rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
                <p className="text-[13.5px] font-bold text-ink-900">{b.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-700/60">{b.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   FEATURE FLAGS
   ============================================================ */
interface AdminFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
}

function FeatureFlagsTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AdminFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/feature-flags")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.flags ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (flag: AdminFlag) => {
    setBusyId(flag.id);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(flag.id), enabled: !flag.enabled }),
      });
      if (res.ok) {
        showToast(!flag.enabled ? `${flag.label} yoqildi` : `${flag.label} o'chirildi`, "success");
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
        <EmptyState icon={<ToggleRight className="h-9 w-9" />} title="Feature flag topilmadi" />
      ) : (
        items.map((f) => (
          <button
            key={f.id}
            disabled={busyId === f.id}
            onClick={() => toggle(f)}
            className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-3.5 text-left disabled:opacity-60"
          >
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-ink-900">{f.label}</p>
              {f.description && <p className="mt-0.5 text-[12px] text-ink-700/50">{f.description}</p>}
              <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-ink-700/30">{f.key}</p>
            </div>
            {f.enabled ? (
              <ToggleRight className="h-8 w-8 shrink-0 text-brand-500" />
            ) : (
              <ToggleLeft className="h-8 w-8 shrink-0 text-ink-700/30" />
            )}
          </button>
        ))
      )}
    </div>
  );
}

/* ============================================================
   SYSTEM SETTINGS  (incl. Maintenance Mode)
   ============================================================ */
interface MaintenanceSetting {
  enabled: boolean;
  message: string;
}

function SettingsTab() {
  const { showToast } = useToast();
  const [maintenance, setMaintenance] = useState<MaintenanceSetting>({ enabled: false, message: "" });
  const [commissionPercent, setCommissionPercent] = useState(3);
  const [supportTelegram, setSupportTelegram] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : { settings: {} }))
      .then((data) => {
        const s = data.settings ?? {};
        if (s.maintenance_mode) setMaintenance(s.maintenance_mode);
        if (s.commission_rate?.percent != null) setCommissionPercent(s.commission_rate.percent);
        if (s.support_contact?.telegram) setSupportTelegram(s.support_contact.telegram);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveSetting = async (key: string, value: unknown, successMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        showToast(successMsg, "success");
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader className="pt-10 px-4" />;

  return (
    <div className="space-y-5 px-4 pb-6">
      <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-heading text-[15px] text-ink-900">Texnik ishlar rejimi</h3>
          <button
            onClick={() => {
              const next = { ...maintenance, enabled: !maintenance.enabled };
              setMaintenance(next);
              saveSetting("maintenance_mode", next, next.enabled ? "Texnik ishlar rejimi yoqildi" : "Texnik ishlar rejimi o'chirildi");
            }}
          >
            {maintenance.enabled ? (
              <ToggleRight className="h-8 w-8 text-error" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-ink-700/30" />
            )}
          </button>
        </div>
        <p className="text-[12.5px] text-ink-700/50">
          Yoqilganda, adminlardan tashqari barcha foydalanuvchilar uchun ilova bloklanadi.
        </p>
        <textarea
          value={maintenance.message}
          onChange={(e) => setMaintenance((m) => ({ ...m, message: e.target.value }))}
          rows={2}
          className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[13.5px] outline-none focus:border-brand-400"
          placeholder="Foydalanuvchilarga ko'rsatiladigan xabar"
        />
        <Button
          size="sm"
          variant="outline"
          loading={saving}
          onClick={() => saveSetting("maintenance_mode", maintenance, "Xabar saqlandi")}
        >
          Xabarni saqlash
        </Button>
      </div>

      <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-4">
        <h3 className="text-heading text-[15px] text-ink-900">Komissiya foizi</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={100}
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(Number(e.target.value))}
            className="w-24 rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
          />
          <span className="text-[13.5px] text-ink-700/60">%</span>
          <Button
            size="sm"
            loading={saving}
            onClick={() => saveSetting("commission_rate", { percent: commissionPercent }, "Komissiya yangilandi")}
          >
            Saqlash
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-[var(--radius-lg)] border border-border bg-white p-4">
        <h3 className="text-heading text-[15px] text-ink-900">Qo&apos;llab-quvvatlash Telegram</h3>
        <div className="flex items-center gap-3">
          <input
            value={supportTelegram}
            onChange={(e) => setSupportTelegram(e.target.value)}
            className="flex-1 rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
            placeholder="@username"
          />
          <Button
            size="sm"
            loading={saving}
            onClick={() => saveSetting("support_contact", { telegram: supportTelegram }, "Kontakt yangilandi")}
          >
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   AUDIT TRAIL / LOGS
   ============================================================ */
interface AdminAuditLog {
  id: string;
  actorName: string | null;
  actorTelegramId: number | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
}

function AuditLogsTab() {
  const [items, setItems] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/audit-logs")
      .then((r) => {
        if (!r.ok) throw new Error("forbidden");
        return r.json();
      })
      .then((data) => setItems(data.logs ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Loader className="pt-10 px-4" />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="space-y-2.5 px-4 pb-6">
      {items.length === 0 ? (
        <EmptyState icon={<ScrollText className="h-9 w-9" />} title="Loglar yo'q" />
      ) : (
        items.map((l) => (
          <div key={l.id} className="rounded-[var(--radius-lg)] border border-border bg-white p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-bold text-ink-900">{l.action}</p>
              <span className="shrink-0 text-[11px] text-ink-700/40">{new Date(l.createdAt).toLocaleString("uz-UZ")}</span>
            </div>
            <p className="mt-0.5 text-[12px] text-ink-700/60">
              {l.actorName ?? "Tizim"} {l.actorTelegramId ? `(ID: ${l.actorTelegramId})` : ""}
              {l.targetType && ` • ${l.targetType}${l.targetId ? ` #${l.targetId}` : ""}`}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
