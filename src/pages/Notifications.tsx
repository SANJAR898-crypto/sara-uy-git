import { motion } from "framer-motion";
import { Bell, ChevronLeft, MessageCircle, Sparkles, Tag } from "lucide-react";
import { notifications } from "../data";
import { EmptyState } from "../components/ui";
import { cn } from "../utils/cn";

const iconByType = {
  price: Tag,
  message: MessageCircle,
  system: Bell,
  vip: Sparkles,
};

export default function Notifications({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-6"
    >
      <div className="safe-top glass sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 px-4 py-3.5">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-heading text-[17px]">Bildirishnomalar</h1>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-9 w-9" />} title="Bildirishnoma yo'q" />
      ) : (
        <div className="divide-y divide-border/70 px-4">
          {notifications.map((n, i) => {
            const Icon = iconByType[n.type];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 py-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    n.type === "vip" ? "bg-vip-bg text-vip-dark" : "bg-brand-50 text-brand-500"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink-900">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-700/60">{n.message}</p>
                  <p className="mt-1 text-[11px] text-ink-700/35">{n.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
