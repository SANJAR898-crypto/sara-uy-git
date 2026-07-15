import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loader({ message = "Yuklanmoqda...", size = 'md' }: LoaderProps) {
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
      <RefreshCw className={`${spinnerSizes[size]} animate-spin text-[#0082D5]`} />
      {message && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{message}</span>}
    </div>
  );
}
