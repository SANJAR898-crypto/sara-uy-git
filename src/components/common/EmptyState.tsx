import React from 'react';
import { BadgeHelp } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "Ma'lumot topilmadi",
  description = "Qidiruv shartlarini o'zgartirib ko'ring yoki boshqa bo'limga o'ting.",
  icon
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
        {icon || <BadgeHelp className="w-8 h-8 opacity-60" />}
      </div>
      <h3 className="font-bold text-sm text-slate-900 tracking-tight">{title}</h3>
      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 max-w-xs">{description}</p>
    </div>
  );
}
