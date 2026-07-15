import React from 'react';
import { User as UserType } from '../../types';

interface MiniAppHeaderProps {
  currentUser: UserType;
  isSubscriptionActive: boolean;
}

export default function MiniAppHeader({ currentUser, isSubscriptionActive }: MiniAppHeaderProps) {
  return (
    <div className="w-full bg-slate-950 text-white px-5 pt-7 pb-11 rounded-b-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.06)] relative font-sans border-b border-slate-900">
      {/* Ambient top light reflection */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/5" />
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'User')}&background=1e293b&color=fff`} 
              alt="User profile" 
              className="w-11 h-11 rounded-full object-cover border border-slate-800 shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-sm" />
          </div>
          <div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">Xush kelibsiz!</span>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1 leading-none">
              {currentUser.fullName}
              {currentUser.isVerifiedSeller && <span className="text-xs" title="Tasdiqlangan sotuvchi">🛡️</span>}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.packageId === 'vip' && isSubscriptionActive && (
            <span className="bg-amber-500/10 text-amber-500 text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full border border-amber-500/20 shadow-sm">
              👑 VIP
            </span>
          )}
          {currentUser.packageId === 'premium' && isSubscriptionActive && (
            <span className="bg-blue-500/10 text-blue-400 text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full border border-blue-500/20 shadow-sm">
              ⚡ Premium
            </span>
          )}
          {(!currentUser.packageId || !isSubscriptionActive) && (
            <span className="bg-slate-800/80 text-slate-400 text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-full border border-slate-700/50">
              🥉 Standard
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
