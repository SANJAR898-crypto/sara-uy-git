import React, { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { Listing, District, SubscriptionTier } from '../../types';

interface AdminSubscriptionsProps {
  plans: any[];
  payments: any[];
  listings: Listing[];
  districts: District[];
  subscriptionHistory: any[];
  editingPlanId: string | null;
  editingPlanPrice: number;
  setEditingPlanId: (id: string | null) => void;
  setEditingPlanPrice: (price: number) => void;
  onEditPlanPrice: (id: string, price: number) => void;
  onAddPlan: (name: string, price: number, duration: number, badge: string) => void;
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string, reason: string) => void;
  onActivateSubscription: (listingId: string, planId: string) => void;
  onExtendSubscription: (listingId: string, days: number) => void;
  onExpireSubscription: (listingId: string) => void;
}

export default function AdminSubscriptions({
  plans,
  payments,
  listings,
  districts,
  subscriptionHistory,
  editingPlanId,
  editingPlanPrice,
  setEditingPlanId,
  setEditingPlanPrice,
  onEditPlanPrice,
  onAddPlan,
  onApprovePayment,
  onRejectPayment,
  onActivateSubscription,
  onExtendSubscription,
  onExpireSubscription
}: AdminSubscriptionsProps) {
  // Local form states
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanBadge, setNewPlanBadge] = useState('💎');
  const [newPlanPrice, setNewPlanPrice] = useState(25);
  const [newPlanDuration, setNewPlanDuration] = useState(30);

  const [assignListingId, setAssignListingId] = useState('');
  const [assignPlanId, setAssignPlanId] = useState<SubscriptionTier>('premium');

  const getDistrictName = (id: string) => {
    return districts.find(d => d.id === id)?.name || "Noma'lum tuman";
  };

  return (
    <div className="space-y-6">
      {/* Header / Intro */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/20 to-transparent p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" /> PREMIUM TARIF TIZIMI
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">Pullik Obunalar va Joylashtirish</h3>
          <p className="text-xs text-white/60 max-w-2xl">
            E'lonlarning ustuvorligini (VIP &gt; Premium &gt; Standard) boshqaring, tarif narxlarini tahrirlang yoki yangi tarif turlarini yarating. Tizim obuna tugash muddatini har 30 soniyada tekshiradi va muddati tugaganlarni avtomatik Standard darajaga tushiradi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Tizim Avto-Tekshiruvi: Yoqilgan</span>
        </div>
      </div>

      {/* Row 1: Planlar narxi va Yangi tarif yaratish */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Planlar va narxlar (Create / Edit Plans) */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
              💳 Tarif Rejalari va Narxlari
            </h4>
            <span className="text-[10px] text-white/40">Tahrirlash imkoniyati bilan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map(p => (
              <div key={p.id} className="bg-slate-950 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-lg">{p.badge}</span>
                  <h5 className="font-extrabold text-sm text-white">{p.name}</h5>
                  <p className="text-[10px] text-white/40">{p.durationDays} kunlik faollik</p>
                </div>

                <div className="pt-2 border-t border-white/5">
                  {editingPlanId === p.id ? (
                    <div className="space-y-2">
                      <label className="text-[9px] text-white/40 block font-bold uppercase">Yangi narx ($)</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number" 
                          className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-xs font-bold text-white"
                          value={editingPlanPrice}
                          onChange={(e) => setEditingPlanPrice(Number(e.target.value))}
                        />
                        <button 
                          onClick={() => {
                            onEditPlanPrice(p.id, editingPlanPrice);
                            setEditingPlanId(null);
                          }}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingPlanId(null)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-bold"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-white/40 block">Narxi:</span>
                        <span className="text-base font-black text-blue-400">${p.price}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingPlanId(p.id);
                          setEditingPlanPrice(p.price);
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 transition rounded-lg text-[10px] font-bold"
                      >
                        O'zgartirish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yangi tarif yaratish (Create custom plans) */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <h4 className="text-sm font-black uppercase text-white">
            ➕ Yangi Tarif Yaratish
          </h4>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPlanName.trim()) return;
              onAddPlan(newPlanName, newPlanPrice, newPlanDuration, newPlanBadge);
              setNewPlanName('');
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Tarif nomi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: VIP+" 
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Badge Emoji</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masalan: 💎 VIP+" 
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
                  value={newPlanBadge}
                  onChange={(e) => setNewPlanBadge(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Narxi ($)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Davomiyligi (kun)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
                  value={newPlanDuration}
                  onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition mt-2 cursor-pointer"
            >
              Tarif Yaratish
            </button>
          </form>
        </div>

      </div>

      {/* Payments awaiting moderation */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
            💸 To'lovlar Moderatsiyasi ({payments.filter((p: any) => p.status === 'pending').length} ta kutilmoqda)
          </h4>
          <span className="text-[10px] text-amber-400 font-bold">Brokerlik paketlari uchun to'lovlar</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-bold text-[9px] uppercase pb-2">
                <th className="pb-3 pl-2">Broker</th>
                <th className="pb-3">Paket (Tarif)</th>
                <th className="pb-3">To'lov Turi</th>
                <th className="pb-3">Suma</th>
                <th className="pb-3">Sana</th>
                <th className="pb-3 text-right pr-2">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/2 transition">
                  <td className="py-3 pl-2">
                    <div className="font-extrabold text-white text-[11px]">{p.userName}</div>
                    <div className="text-[9px] text-white/40 font-mono">{p.userPhone} • ID: {p.userId}</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                      p.packageId === 'vip' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      🏆 {p.packageId?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="uppercase text-[10px] text-slate-300 font-bold font-mono">
                      💳 {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-black text-emerald-400 text-xs">
                    ${p.amount}
                  </td>
                  <td className="py-3 text-[10px] text-white/50">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 text-right pr-2 space-x-2">
                    {p.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => onApprovePayment(p.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black tracking-wider uppercase transition cursor-pointer"
                        >
                          ✓ Tasdiqlash
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Rad etish sababini kiriting:");
                            if (reason) onRejectPayment(p.id, reason);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[9px] font-black tracking-wider uppercase transition cursor-pointer"
                        >
                          ✕ Rad etish
                        </button>
                      </>
                    ) : (
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                        p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {p.status === 'approved' ? "Tasdiqlangan" : `Rad etilgan (${p.rejectionReason || 'Rad etildi'})`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/40">
                    Hozircha birorta ham to'lov arizasi yuborilmagan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Obuna biriktirish va Faol obunalar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Obuna biriktirish */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <h4 className="text-sm font-black uppercase text-white">
              ⚡ E'lon uchun Obunani faollashtirish
            </h4>
            <p className="text-[10px] text-white/40">E'lonni VIP yoki Premium tariflariga o'tkazish va muddat belgilash</p>
          </div>

          <div className="space-y-3.5 my-3">
            <div>
              <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">E'lonni tanlang</label>
              <select 
                value={assignListingId}
                onChange={(e) => setAssignListingId(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              >
                <option value="">-- E'lonni tanlang --</option>
                {listings.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.plan !== 'standard' ? `${plans.find(p => p.id === l.plan)?.badge || '💎'} ` : ''} 
                    {l.title.slice(0, 45)}... [${l.price.toLocaleString()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Tarifni tanlang</label>
              <select 
                value={assignPlanId}
                onChange={(e) => setAssignPlanId(e.target.value as SubscriptionTier)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.badge} {p.name} (${p.price})</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={() => {
              if (!assignListingId) return;
              onActivateSubscription(assignListingId, assignPlanId);
              setAssignListingId('');
            }}
            disabled={!assignListingId}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition mt-4 cursor-pointer"
          >
            Obunani Faollashtirish
          </button>
        </div>

        {/* Faol obunalar ro'yxati */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
              👑 Faol Obunalar ({listings.filter(l => l.plan !== 'standard').length} ta)
            </h4>
            <span className="text-[10px] text-amber-400 font-bold">VIP &gt; Premium tartibda joylashgan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-bold text-[9px] uppercase">
                  <th className="pb-3 pl-2">Mulk / E'lon</th>
                  <th className="pb-3">Tarif</th>
                  <th className="pb-3">Tugash muddati</th>
                  <th className="pb-3 text-right pr-2">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listings.filter(l => l.plan !== 'standard').map(l => {
                  const activePlan = plans.find(p => p.id === l.plan);
                  const daysLeft = l.planExpiresAt 
                    ? Math.ceil((new Date(l.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <tr key={l.id} className="hover:bg-white/2 transition">
                      <td className="py-3.5 pl-2 max-w-[240px]">
                        <div className="flex items-center gap-3">
                          <img 
                            src={l.imageUrls[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                            className="w-8 h-8 rounded-lg object-cover shrink-0" 
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-white truncate text-[11px]">{l.title}</h5>
                            <span className="text-[9px] text-white/40">Id: {l.id} • {getDistrictName(l.districtId)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 font-black text-[9px]">
                          {activePlan?.badge || l.plan?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <span className={`font-extrabold ${daysLeft <= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {daysLeft > 0 ? `${daysLeft} kun qoldi` : 'Muddati tugagan'}
                          </span>
                          <span className="text-[8px] text-white/30 block">
                            {l.planExpiresAt ? new Date(l.planExpiresAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-1.5 shrink-0">
                        <button 
                          onClick={() => onExtendSubscription(l.id, 30)}
                          className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          +30 kun
                        </button>
                        <button 
                          onClick={() => onExpireSubscription(l.id)}
                          className="px-2 py-1 bg-rose-600/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-[9px] font-bold cursor-pointer"
                        >
                          Yakunlash
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {listings.filter(l => l.plan !== 'standard').length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-white/40">
                      Hozirda faol pullik obunalar mavjud emas. E'lonlarga chapdagi panel orqali VIP/Premium maqom bering.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Row 3: Obunalar tarixi (Transactions log) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black uppercase text-white flex items-center gap-2">
            📋 Obunalar Faolligi va To'lovlar Tarixi
          </h4>
          <span className="text-[10px] text-emerald-400 font-mono">Tranzaksiyalar monitoringi</span>
        </div>

        <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-bold text-[9px] uppercase pb-2">
                <th className="pb-3 pl-2">Tranzaksiya Id</th>
                <th className="pb-3">Mulk / E'lon sarlavhasi</th>
                <th className="pb-3">Tarif</th>
                <th className="pb-3">Faollashgan vaqt</th>
                <th className="pb-3">Tugash vaqti</th>
                <th className="pb-3">To'lov miqdori</th>
                <th className="pb-3 text-right pr-2">Holati</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {subscriptionHistory.map((sh, idx) => (
                <tr key={sh.id || idx} className="hover:bg-white/2 transition">
                  <td className="py-2.5 pl-2 font-mono text-[9px] text-white/40">{sh.id}</td>
                  <td className="py-2.5 truncate max-w-[280px] font-bold text-white/90">{sh.listingTitle}</td>
                  <td className="py-2.5">
                    <span className="uppercase text-[9px] font-extrabold text-blue-400">
                      {sh.planId}
                    </span>
                  </td>
                  <td className="py-2.5 text-[10px] text-white/50">
                    {new Date(sh.startDate).toLocaleString()}
                  </td>
                  <td className="py-2.5 text-[10px] text-white/50">
                    {new Date(sh.endDate).toLocaleString()}
                  </td>
                  <td className="py-2.5 font-bold text-emerald-400">${sh.pricePaid}</td>
                  <td className="py-2.5 text-right pr-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      sh.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      sh.status === 'expired' ? 'bg-white/5 text-white/40 border border-white/10' : 
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {sh.status === 'active' ? 'Faol' : sh.status === 'expired' ? 'Tugagan' : 'Muddati uzaytirilgan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
