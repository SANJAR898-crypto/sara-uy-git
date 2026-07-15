import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between px-4">
      <div>
        <h2 className="text-[17px] font-extrabold tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-0.5 text-xs font-semibold text-brand-600">
          Barchasi <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
