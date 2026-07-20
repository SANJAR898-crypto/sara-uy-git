"use client";

import { motion } from "framer-motion";
import { Award, Briefcase, Clock, Globe2, MessageSquareText, Phone, Save, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Loader } from "@/components/ui";
import { useSession, useToast } from "@/components/providers";

const LANGUAGE_OPTIONS = ["O'zbek", "Rus", "Ingliz", "Tojik", "Qozoq"];

export default function SellerProfilePage() {
  const { user, loading, refresh } = useSession();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [isAgency, setIsAgency] = useState(false);
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState("");

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone ?? "");
    setAgencyName(user.agencyName ?? "");
    setIsAgency(user.isAgency ?? false);
    setBio(user.bio ?? "");
    setLanguages(user.languages ?? []);
    setWorkingHours(user.workingHours ?? "");
  }, [user]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, agencyName, isAgency, bio, languages, workingHours }),
      });
      if (res.ok) {
        await refresh();
        showToast("Profil yangilandi", "success");
      } else {
        showToast("Xatolik yuz berdi", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <Loader className="pt-16" />;

  return (
    <div className="space-y-6 px-4 pb-10 pt-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-[var(--radius-xl)] bg-gradient-to-br from-[#08233a] via-[#0b5c94] to-brand-500 p-5 text-white shadow-[var(--shadow-lift)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-white/40" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-bold">{user.name}</p>
          <p className="text-[12.5px] text-white/60">{user.username ? `@${user.username}` : "Telegram foydalanuvchisi"}</p>
          <div className="mt-1 flex items-center gap-3 text-[12.5px] font-semibold">
            <span className="flex items-center gap-1 text-vip">
              <Star className="h-3.5 w-3.5 fill-vip" /> {user.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-white/80">
              <Award className="h-3.5 w-3.5" /> {user.dealsCount} bitim
            </span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-white p-4">
        <Field label="Telefon raqami" icon={<Phone className="h-4 w-4" />}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-700/40"
          />
        </Field>

        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 text-brand-500" />
            <span className="text-[13.5px] font-semibold text-ink-900">Agentlikman</span>
          </div>
          <button
            onClick={() => setIsAgency((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${isAgency ? "bg-brand-500" : "bg-black/10"}`}
          >
            <motion.span
              className="block h-5 w-5 rounded-full bg-white shadow"
              animate={{ x: isAgency ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {isAgency && (
          <Field label="Agentlik nomi" icon={<Briefcase className="h-4 w-4" />}>
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Masalan: Premium Estate"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-700/40"
            />
          </Field>
        )}

        <Field label="Ish vaqti" icon={<Clock className="h-4 w-4" />}>
          <input
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
            placeholder="09:00 - 19:00"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-700/40"
          />
        </Field>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
            <MessageSquareText className="h-4 w-4 text-brand-500" /> Bio / Tavsif
          </p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="O'zingiz va xizmatlaringiz haqida qisqacha yozing..."
            className="w-full rounded-[var(--radius-md)] border border-border bg-white p-3 text-[13.5px] outline-none placeholder:text-ink-700/40 focus:border-brand-300"
          />
          <p className="mt-1 text-right text-[11px] text-ink-700/40">{bio.length}/600</p>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
            <Globe2 className="h-4 w-4 text-brand-500" /> Tillar
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                  languages.includes(lang) ? "border-brand-500 bg-brand-500 text-white" : "border-border text-ink-700/70"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full" loading={saving} onClick={save}>
        <Save className="h-4.5 w-4.5" /> Saqlash
      </Button>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-ink-700/60">
        {icon} {label}
      </p>
      <div className="rounded-[var(--radius-md)] border border-border px-3.5 py-3">{children}</div>
    </div>
  );
}
