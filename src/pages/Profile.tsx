import { motion } from "framer-motion";
import {
  Award,
  Bell,
  ChevronRight,
  Eye,
  Globe,
  Heart,
  HelpCircle,
  List,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { currentUser } from "../data";
import { useFavorites, useToast } from "../context";
import { Badge } from "../components/ui";

export default function Profile({ onOpenNotifications }: { onOpenNotifications: () => void }) {
  const { favoriteIds } = useFavorites();
  const { showToast } = useToast();

  const menuItems = [
    { icon: List, label: "Mening e'lonlarim", value: currentUser.listingsCount, action: () => showToast("E'lonlar ro'yxati", "info") },
    { icon: Bell, label: "Bildirishnomalar", action: onOpenNotifications },
    { icon: Shield, label: "Admin panel", action: () => showToast("Admin panelga o'tish (tez orada)", "info") },
    { icon: Globe, label: "Til / Language", value: "O'zbek", action: () => showToast("Til tanlash", "info") },
    { icon: Settings, label: "Sozlamalar", action: () => showToast("Sozlamalar", "info") },
    { icon: HelpCircle, label: "Yordam va qo'llab-quvvatlash", action: () => showToast("Qo'llab-quvvatlash", "info") },
  ];

  return (
    <div className="space-y-5 pb-6 pt-5">
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[#08233a] to-brand-600 p-5 text-white shadow-[var(--shadow-lift)]"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={currentUser.avatar} className="h-16 w-16 rounded-full object-cover ring-2 ring-white/40" alt="" />
              {currentUser.verified && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-brand-600">
                  <Award className="h-3 w-3 text-white" />
                </span>
              )}
            </div>
            <div>
              <p className="text-heading text-[18px] text-white">{currentUser.name}</p>
              <p className="text-[13px] text-white/60">{currentUser.phone}</p>
              <Badge variant="vip" className="mt-1.5">A'zo {currentUser.memberSince} dan beri</Badge>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-[var(--radius-lg)] bg-white/10 p-3 backdrop-blur">
            <Stat icon={<List className="h-4 w-4" />} label="E'lonlar" value={currentUser.listingsCount} />
            <Stat icon={<Heart className="h-4 w-4" />} label="Sevimli" value={favoriteIds.size} />
            <Stat icon={<Eye className="h-4 w-4" />} label="Ko'rishlar" value={currentUser.viewsCount} />
          </div>
        </motion.div>
      </div>

      <div className="px-4">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              whileTap={{ backgroundColor: "rgba(11,132,214,0.06)" }}
              onClick={item.action}
              className={`flex w-full items-center gap-3.5 px-4 py-4 text-left ${i !== menuItems.length - 1 ? "border-b border-border/70" : ""}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <span className="flex-1 text-[14px] font-medium text-ink-900">{item.label}</span>
              {item.value && <span className="text-[13px] text-ink-700/40">{item.value}</span>}
              <ChevronRight className="h-4 w-4 text-ink-700/30" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={() => showToast("Tizimdan chiqildi", "info")}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-error/20 bg-error-bg py-3.5 text-[14px] font-semibold text-error"
        >
          <LogOut className="h-4 w-4" /> Chiqish
        </button>
      </div>

      <p className="px-4 text-center text-[11px] text-ink-700/30">Sara Uylar v3.0 — Premium Design System</p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1 text-white">
      {icon}
      <p className="text-[15px] font-bold">{value}</p>
      <p className="text-[10px] text-white/50">{label}</p>
    </div>
  );
}
