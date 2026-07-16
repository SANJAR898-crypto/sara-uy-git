"use client";

import { Globe, Info, MessageSquareText, Moon, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InnerHeader } from "@/components/layout";
import { Button, Loader } from "@/components/ui";
import { useSession, useToast } from "@/components/providers";
import { attachBackButton } from "@/lib/telegram-client";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, refresh } = useSession();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => attachBackButton(() => router.back()), [router]);
  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user?.phone]);

  const savePhone = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        await refresh();
        showToast("Telefon raqami saqlandi", "success");
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <InnerHeader title="Sozlamalar" />

      {loading ? (
        <Loader className="pt-16" />
      ) : (
        <div className="space-y-6 px-4 py-5">
          <section>
            <p className="mb-2.5 text-[13px] font-semibold text-ink-700/50">Aloqa ma&apos;lumotlari</p>
            <div className="rounded-[var(--radius-lg)] border border-border bg-white p-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-700/60">
                <Phone className="h-3.5 w-3.5" /> Telefon raqam
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-[var(--radius-md)] border border-border px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-400"
              />
              <Button size="sm" className="mt-3" loading={saving} onClick={savePhone}>
                Saqlash
              </Button>
            </div>
          </section>

          <section>
            <p className="mb-2.5 text-[13px] font-semibold text-ink-700/50">Ilova</p>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white">
              <Row icon={<Globe className="h-4.5 w-4.5" />} label="Til" value="O'zbekcha" />
              <Row icon={<Moon className="h-4.5 w-4.5" />} label="Mavzu" value="Telegram tema" />
              <Row icon={<ShieldCheck className="h-4.5 w-4.5" />} label="Maxfiylik siyosati" value="" last />
            </div>
          </section>

          <section>
            <p className="mb-2.5 text-[13px] font-semibold text-ink-700/50">Yordam</p>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white">
              <Row icon={<MessageSquareText className="h-4.5 w-4.5" />} label="Qo'llab-quvvatlash" value="@sara_support" />
              <Row icon={<Info className="h-4.5 w-4.5" />} label="Ilova versiyasi" value="v3.0.0" last />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!last ? "border-b border-border" : ""}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
      <span className="flex-1 text-[14px] font-semibold text-ink-900">{label}</span>
      {value && <span className="text-[13px] text-ink-700/50">{value}</span>}
    </div>
  );
}
