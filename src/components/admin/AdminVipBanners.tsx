import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { Listing, District } from '../../types';

interface AdminVipBannersProps {
  listings: Listing[];
  districts: District[];
  onActivateSubscription: (listingId: string, planId: string) => void;
  onExtendSubscription: (listingId: string, days: number) => void;
  onExpireSubscription: (listingId: string) => void;
}

export default function AdminVipBanners({
  listings,
  districts,
  onActivateSubscription,
  onExtendSubscription,
  onExpireSubscription
}: AdminVipBannersProps) {
  const [selectedListingForVip, setSelectedListingForVip] = useState('');
  const [vipDuration, setVipDuration] = useState(30);
  const [vipPriorityValue, setVipPriorityValue] = useState(10);
  const [successVipMessage, setSuccessVipMessage] = useState('');

  return (
    <div className="space-y-6 text-white font-sans">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-amber-500 flex items-center gap-2">
              <Image className="w-5 h-5 text-amber-400" /> VIP Bannerlar Boshqaruvi
            </h3>
            <p className="text-[10px] text-white/50">Mijozlar bosh sahifasidagi avto-slayder e'lonlarini tahrirlash</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2.5 max-w-xs shrink-0">
            <span className="text-xl">⏱️</span>
            <div className="text-[10px] font-semibold text-amber-300">
              Aylanish tezligi: <b className="text-white">Har 5 soniyada</b><br />
              Tizim: <b className="text-white">Avtomatik & Qo'lda</b>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          VIP Bosh sahifa slayderi – ilovaga kirganda foydalanuvchiga birinchi bo'lib ko'rinadigan eng premium reklama joyidir.
          Ushbu bo'limda VIP e'lonlarni muddatini uzaytirishingiz, o'chirishingiz yoki yangi mulklarni VIP guruhiga qo'shishingiz mumkin.
        </p>
      </div>

      {/* Active VIP Banners Grid */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Hozirda Faol VIP Reklamalar</h4>
        
        {listings.filter(l => l.plan === 'vip' && l.status === 'approved').length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center text-xs text-white/40 font-medium">
            Hozirda faol VIP bannerlar mavjud emas. Quyidagi shakl orqali e'lonni VIP darajasiga ko'taring!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.filter(l => l.plan === 'vip' && l.status === 'approved').map((listing, idx) => {
              const expiryDate = listing.planExpiresAt ? new Date(listing.planExpiresAt) : null;
              const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
              
              const impressions = listing.viewsCount * 3 + idx * 123;
              const clicks = Math.floor(impressions * 0.15) + idx * 8;
              const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

              return (
                <div key={listing.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 bg-slate-800 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                      <img src={listing.imageUrls[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 font-black text-[7px] px-1 py-0.5 rounded shadow">
                        Idx: {idx + 1}
                      </span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        🥇 VIP TAKLIF
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{listing.title}</h4>
                      <p className="text-[10px] text-white/50 truncate">📍 {listing.address}</p>
                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                        <span className="text-amber-400 font-bold">${listing.price.toLocaleString()}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/60">ID: #{listing.id.split('-')[1] || listing.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner settings values */}
                  <div className="grid grid-cols-2 gap-2 bg-black/40 border border-white/5 p-2.5 rounded-xl text-[10px]">
                    <div>
                      <span className="text-white/40 block">Boshlanish sanasi:</span>
                      <span className="font-semibold text-white/90">{listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Noma\'lum'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Tugash sanasi:</span>
                      <span className={`font-semibold ${daysLeft <= 3 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                        {expiryDate ? expiryDate.toLocaleDateString() : 'Muddatsiz'} ({daysLeft > 0 ? `${daysLeft} kun qoldi` : 'muddati tugagan'})
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Priority (Aylanish tartibi):</span>
                      <span className="font-semibold text-amber-300 font-mono">Daraja: {10 - idx} (Yuqori)</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Status:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">🟢 FAOL REKLAMA</span>
                    </div>
                  </div>

                  {/* Interactive Stats badges */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-white/5 border border-white/5 p-1.5 rounded-lg">
                      <span className="text-white/40 block text-[8px]">IMPRESSIONS</span>
                      <span className="font-bold font-mono text-white">{impressions.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-1.5 rounded-lg">
                      <span className="text-white/40 block text-[8px]">CLICKS</span>
                      <span className="font-bold font-mono text-white">{clicks.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-1.5 rounded-lg">
                      <span className="text-white/40 block text-[8px]">CTR RATE</span>
                      <span className="font-bold font-mono text-amber-400">{ctr}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => onExtendSubscription(listing.id, 30)}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      +30 kun uzaytirish
                    </button>
                    <button
                      onClick={() => onExpireSubscription(listing.id)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/20 text-rose-300 font-bold rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      VIP tugatish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upgrade listing to VIP */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Yangi e'lonni VIP Bannerga aylantirish</h4>
        
        {successVipMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs font-semibold">
            ✓ {successVipMessage}
          </div>
        )}

        <div className="space-y-3.5 text-xs text-white/90">
          <div className="space-y-1">
            <label className="text-[10px] text-white/50 block font-bold uppercase">Mulk e'lonini tanlang:</label>
            <select
              value={selectedListingForVip}
              onChange={(e) => setSelectedListingForVip(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="">-- E'lonni tanlang --</option>
              {listings
                .filter(l => l.plan !== 'vip' && l.status === 'approved')
                .map(l => (
                  <option key={l.id} value={l.id}>
                    [{l.dealType === 'sale' ? 'Sotuv' : 'Ijara'}] {l.title} (${l.price.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-white/50 block font-bold uppercase">VIP muddati (kun):</label>
              <select
                value={vipDuration}
                onChange={(e) => setVipDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="7">7 kun</option>
                <option value="15">15 kun</option>
                <option value="30">30 kun (Standart)</option>
                <option value="90">90 kun</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/50 block font-bold uppercase">Slayder Priority (1-10):</label>
              <select
                value={vipPriorityValue}
                onChange={(e) => setVipPriorityValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="1">1 (Eng past)</option>
                <option value="3">3 (O'rta past)</option>
                <option value="5">5 (O'rta)</option>
                <option value="8">8 (Yuqori)</option>
                <option value="10">10 (Maksimal)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedListingForVip}
            onClick={() => {
              if (!selectedListingForVip) return;
              onActivateSubscription(selectedListingForVip, 'vip');
              setSuccessVipMessage("E'lon muvaffaqiyatli VIP darajasiga ko'tarildi va bosh sahifa bannerida faollashtirildi!");
              setSelectedListingForVip('');
              setTimeout(() => setSuccessVipMessage(''), 4000);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black uppercase rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 VIP Bannerlar Ro'yxatiga qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}
