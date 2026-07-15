"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, SearchX, X } from "lucide-react";
import { type ButtonHTMLAttributes, type ReactNode, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useToast, type ToastItem } from "@/components/providers";

/* ============== Button ============== */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-semibold select-none whitespace-nowrap transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";
  const variants: Record<string, string> = {
    primary: "bg-brand-500 text-white shadow-[var(--shadow-brand)] hover:bg-brand-600 active:bg-brand-700",
    secondary: "bg-brand-50 text-brand-600 hover:bg-brand-100 active:bg-brand-200",
    ghost: "bg-transparent text-ink-900 hover:bg-black/[0.04] active:bg-black/[0.08]",
    outline: "bg-white text-ink-900 border border-border hover:border-brand-300 active:bg-brand-50",
    danger: "bg-error text-white hover:bg-red-600 active:bg-red-700",
  };
  const sizes: Record<string, string> = {
    sm: "h-9 px-3.5 text-[13px] rounded-[var(--radius-sm)]",
    md: "h-12 px-5 text-[15px] rounded-[var(--radius-md)]",
    lg: "h-14 px-6 text-[16px] rounded-[var(--radius-lg)]",
    icon: "h-11 w-11 rounded-[var(--radius-md)]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  );
}

/* ============== Icon Button ============== */
export function IconButton({
  className,
  children,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        active ? "bg-brand-500 text-white" : "bg-white/90 text-ink-900 hover:bg-white",
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

/* ============== Badge ============== */
export function Badge({
  children,
  variant = "default",
  className,
  icon,
}: {
  children: ReactNode;
  variant?: "default" | "vip" | "verified" | "new" | "rent" | "danger";
  className?: string;
  icon?: ReactNode;
}) {
  const variants: Record<string, string> = {
    default: "bg-black/[0.05] text-ink-800",
    vip: "bg-gradient-to-r from-[#f3d27a] to-[var(--color-vip)] text-[#5c4108] shadow-[var(--shadow-vip)]",
    verified: "bg-emerald-50 text-emerald-600",
    new: "bg-brand-500 text-white",
    rent: "bg-violet-50 text-violet-600",
    danger: "bg-error-bg text-error",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
        variants[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ============== Skeleton ============== */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer-bg rounded-[var(--radius-sm)]", className)} />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[4/3] w-full rounded-[var(--radius-lg)]" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/5" />
      </div>
    </div>
  );
}

/* ============== Loader ============== */
export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-10", className)}>
      <motion.div
        className="h-9 w-9 rounded-full border-[3px] border-brand-100 border-t-brand-500"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </div>
  );
}

/* ============== Empty / Error states ============== */
export function EmptyState({
  title,
  message,
  icon,
  action,
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-400">
        {icon ?? <SearchX className="h-9 w-9" />}
      </div>
      <h3 className="text-heading text-[17px] text-ink-900">{title}</h3>
      {message && <p className="max-w-[240px] text-[14px] leading-relaxed text-ink-700/60">{message}</p>}
      {action}
    </motion.div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-9 w-9 text-warning" />}
      title="Nimadir xato ketdi"
      message="Ma'lumotlarni yuklab bo'lmadi. Iltimos qaytadan urinib ko'ring."
      action={
        onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry} className="mt-1">
            Qayta urinish
          </Button>
        )
      }
    />
  );
}

/* ============== Modal ============== */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="relative z-10 w-full max-w-sm rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-lift)]"
          >
            {title && (
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-heading text-[18px]">{title}</h3>
                <button onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============== Bottom Sheet ============== */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  heightClass = "max-h-[85vh]",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  heightClass?: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center" initial={false}>
          <motion.div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-t-[var(--radius-2xl)] bg-white pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-lift)]",
              heightClass
            )}
          >
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-10 rounded-full bg-black/10" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-5 pb-2 pt-3">
                <h3 className="text-heading text-[18px]">{title}</h3>
                <button onClick={onClose} className="rounded-full p-1.5 hover:bg-black/5">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(85vh - 60px)" }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============== Toast ============== */
const toastIcon: Record<ToastItem["variant"], ReactNode> = {
  success: <CheckCircle2 className="h-4.5 w-4.5 text-success" />,
  error: <AlertTriangle className="h-4.5 w-4.5 text-error" />,
  info: <Info className="h-4.5 w-4.5 text-brand-500" />,
};

export function ToastContainer() {
  const { toasts } = useToast();
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-[calc(env(safe-area-inset-top)+14px)] z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="glass pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-[var(--radius-md)] px-4 py-3 shadow-[var(--shadow-card)]"
          >
            {toastIcon[t.variant]}
            <span className="text-[13.5px] font-medium text-ink-900">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
