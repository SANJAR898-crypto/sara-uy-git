import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon ?? <SearchX size={28} />}
      </div>
      <div>
        <p className="font-bold text-ink-700">{title}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
