import React from 'react';
import { User as UserType } from '../../types';

interface LimitExceededViewProps {
  currentUser: UserType;
  isSubscriptionActive: boolean;
  maxListings: number;
  userListingsCount: number;
  triggerOpenPackageShop: (pkgId: 'standard' | 'premium' | 'vip') => void;
}

export default function LimitExceededView({
  currentUser,
  isSubscriptionActive,
  maxListings,
  userListingsCount,
  triggerOpenPackageShop
}: LimitExceededViewProps) {
  return (
    <div className="space-y-5 text-center font-sans">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#0082D5] border-b border-[#E2EAF8] pb-2">E'lon berish limiti</h3>
      
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
        <span className="text-2xl">⚠️</span>
        <h4 className="font-black text-xs text-amber-900 uppercase">E'lon berish limiti yakunlandi!</h4>
        <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
          Siz hozirda <b>{isSubscriptionActive ? (currentUser.packageId === 'vip' ? '👑 VIP' : currentUser.packageId === 'premium' ? '⚡ Premium' : '🥉 Standard') : '🎫 Bepul Sinov'}</b> tarifidasiz. 
          Ushbu tarif bo'yicha jami e'lonlar limitiga (<b>{maxListings} ta e'lon</b>) yetgansiz.
          Siz yaratgan e'lonlar soni: <b>{userListingsCount} ta</b>.
        </p>
        <p className="text-[9.5px] text-slate-500 font-semibold">
          Ko'proq e'lon joylashtirish va ko'proq mijozlarni jalb qilish uchun professional brokerlik paketlaridan birini tanlang va faollashtiring:
        </p>
      </div>

      {/* Package Upgrade Options */}
      <div className="space-y-3.5 text-left">
        {/* Standard Package */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥉</span>
              <div>
                <h5 className="text-[11px] font-black text-slate-900 uppercase">Standard Broker</h5>
                <p className="text-[8px] text-slate-400 font-bold uppercase">5 ta e'lon berish limiti</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#0082D5] font-mono">$5 / oy</span>
          </div>
          <p className="text-[9px] text-slate-500 font-medium leading-normal">
            ✓ 5 tagacha faol e'lon joylashtirish imkoniyati<br />
            ✓ 1 ta e'lonni "Premium" qilish imkoniyati ($1.50 qiymatida)<br />
            ✓ Avtomatik va qo'lda e'lon ko'tarish funksiyasi
          </p>
          <button 
            type="button"
            onClick={() => triggerOpenPackageShop('standard')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-extrabold cursor-pointer transition"
          >
            Ushbu tarifni faollashtirish
          </button>
        </div>

        {/* Premium Package */}
        <div className="bg-white border-2 border-[#0082D5]/40 rounded-2xl p-4 space-y-3 shadow-xs hover:border-[#0082D5]/60 transition relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#0082D5] text-white text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest">Ommabop</div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <h5 className="text-[11px] font-black text-slate-900 uppercase">Premium Broker</h5>
                <p className="text-[8px] text-[#0082D5] font-black uppercase">10 ta e'lon berish limiti</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#0082D5] font-mono">$10 / oy</span>
          </div>
          <p className="text-[9px] text-slate-500 font-medium leading-normal">
            ✓ 10 tagacha faol e'lon joylashtirish imkoniyati<br />
            ✓ 3 ta e'lonni "Premium" qilish imkoniyati ($4.50 qiymatida)<br />
            ✓ Doimiy ustuvor ko'tarilish va maxsus qo'llab-quvvatlash
          </p>
          <button 
            type="button"
            onClick={() => triggerOpenPackageShop('premium')}
            className="w-full py-2 bg-[#0082D5] hover:bg-blue-600 text-white rounded-xl text-[10px] font-extrabold cursor-pointer transition"
          >
            Tarifni hozir sotib olish
          </button>
        </div>

        {/* VIP Package */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3 shadow-xs hover:border-amber-500 transition relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest">Cheksiz</div>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <div>
                <h5 className="text-[11px] font-black text-amber-950 uppercase">VIP Agent</h5>
                <p className="text-[8px] text-amber-600 font-black uppercase">50 ta e'lon berish limiti</p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-600 font-mono">$25 / oy</span>
          </div>
          <p className="text-[9px] text-amber-950/70 font-bold leading-normal">
            ✓ 50 tagacha faol e'lon joylashtirish imkoniyati<br />
            ✓ 10 ta e'lonni "Premium" qilish imkoniyati ($15.00 qiymatida)<br />
            ✓ VIP xizmat ko'rsatish va botda bevosita reklama
          </p>
          <button 
            type="button"
            onClick={() => triggerOpenPackageShop('vip')}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-[10px] font-black rounded-xl cursor-pointer transition"
          >
            VIP bo'lish va cheksiz e'lon
          </button>
        </div>
      </div>
    </div>
  );
}
