import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Listing, Inquiry, Region } from '../../types';

interface AdminDashboardProps {
  listings: Listing[];
  inquiries: Inquiry[];
  regions: Region[];
}

export default function AdminDashboard({ listings, inquiries, regions }: AdminDashboardProps) {
  const approvedCount = listings.filter(l => l.status === 'approved').length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const premiumCount = listings.filter(l => l.isPremium).length;
  
  const totalInquiries = inquiries.length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  const salesCount = listings.filter(l => l.dealType === 'sale').length;
  const rentalsCount = listings.filter(l => l.dealType === 'rent').length;

  const regionalData = regions.map(reg => {
    const count = listings.filter(l => l.regionId === reg.id).length;
    return { name: reg.name, soni: count };
  });

  const inquiriesTrendData = [
    { name: 'Yanvar', sorovlar: 12 },
    { name: 'Fevral', sorovlar: 18 },
    { name: 'Mart', sorovlar: 35 },
    { name: 'Aprel', sorovlar: 48 },
    { name: 'May', sorovlar: 82 },
    { name: 'Iyun', sorovlar: 120 },
    { name: 'Bugun', sorovlar: totalInquiries + 150 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI statistics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Jami e'lonlar</span>
            <h3 className="text-xl font-black text-white mt-1">{listings.length} ta</h3>
            <span className="text-[9px] text-emerald-400 block mt-0.5">🟢 {approvedCount} faol uylar</span>
          </div>
          <div className="w-10 h-10 bg-blue-600/15 border border-blue-500/20 rounded-xl flex items-center justify-center text-lg">🏠</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Kutilayotganlar</span>
            <h3 className="text-xl font-black text-amber-400 mt-1">{pendingCount} ta</h3>
            <span className="text-[9px] text-white/40 block mt-0.5">moderatsiya navbatida</span>
          </div>
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center text-lg">⏳</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Mijoz so'rovlari</span>
            <h3 className="text-xl font-black text-white mt-1">{totalInquiries} ta</h3>
            <span className="text-[9px] text-blue-400 block mt-0.5">🔵 {newInquiriesCount} tasi yangi</span>
          </div>
          <div className="w-10 h-10 bg-sky-500/15 border border-sky-500/20 rounded-xl flex items-center justify-center text-lg">💬</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Premium e'lonlar</span>
            <h3 className="text-xl font-black text-amber-500 mt-1">{premiumCount} ta</h3>
            <span className="text-[9px] text-amber-400 block mt-0.5">bosh sahifa bannerida</span>
          </div>
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center text-lg">⭐</div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monthly Inquiries Chart */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">Yuborilgan so'rovlar o'sish dinamikasi</h3>
            <span className="text-[10px] text-white/40">Oylik tahlil</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inquiriesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="sorovlar" name="Mijozlar so'rovi" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInquiries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Deal types distribution (Sale vs Rent) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-1">Mulk kelishuv turlari</h3>
            <span className="text-[9px] text-white/40 block mb-3">Sotuv va ijara nisbati</span>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Sotiladigan:</span>
                <span className="font-extrabold">{salesCount} ta e'lon ({Math.round(salesCount / (listings.length || 1) * 100)}%)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ijaraga beriladigan:</span>
                <span className="font-extrabold">{rentalsCount} ta e'lon ({Math.round(rentalsCount / (listings.length || 1) * 100)}%)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[10px] text-white/50 leading-relaxed">
            💡 <b>Platforma Maslahati:</b> Ijara e'lonlarining ko'payishi platformadagi yillik aylanmani oshiradi. Realtorlar bilan yangi arenda shartnomalarini tuzing.
          </div>
        </div>
      </div>

      {/* Region volume stats bar chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-blue-400">Viloyatlar bo'yicha uylar soni</h3>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="soni" name="Uylar soni" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
