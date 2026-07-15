import React from 'react';
import SaraUylarLogo from '../SaraUylarLogo';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 px-4 py-3 bg-white border-b border-[#E2EAF8] flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <SaraUylarLogo size="sm" variant="icon" />
        <div>
          <h1 className="text-xs font-extrabold tracking-tight text-[#0082D5] font-display uppercase">SARA UYLAR</h1>
          <span className="text-[8px] text-slate-400 font-bold block -mt-1 tracking-wide">Telegram Real Estate</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full py-0.5 px-2">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
        <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-widest">Mini App</span>
      </div>
    </header>
  );
}
