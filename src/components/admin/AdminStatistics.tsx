import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Listing, Inquiry } from '../../types';

interface AdminStatisticsProps {
  listings: Listing[];
  payments: any[];
  inquiries: Inquiry[];
}

export default function AdminStatistics({
  listings,
  payments,
  inquiries
}: AdminStatisticsProps) {
  const approvedCount = listings.filter(l => l.status === 'approved').length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);
  const vipCount = listings.filter(l => l.plan === 'vip' && l.status === 'approved').length;
  const premiumCount = listings.filter(l => l.plan === 'premium' && l.status === 'approved').length;

  const apartmentCount = listings.filter(l => l.propertyType === 'apartment').length;
  const houseCount = listings.filter(l => l.propertyType === 'house').length;
  const landCount = listings.filter(l => l.propertyType === 'land').length;
  const commercialCount = listings.filter(l => l.propertyType === 'commercial').length;
  const newBuildingCount = listings.filter(l => l.propertyType === 'new_building').length;

  const propertyTypeCountsData = [
    { name: 'Kvartira', value: apartmentCount, color: '#3b82f6' },
    { name: 'Hovli', value: houseCount, color: '#10b981' },
    { name: 'Novostroyka', value: newBuildingCount, color: '#f59e0b' },
    { name: 'Er uchastkasi', value: landCount, color: '#8b5cf6' },
    { name: 'Tijoriy', value: commercialCount, color: '#ec4899' },
  ].filter(d => d.value > 0);

  const saleCount = listings.filter(l => l.dealType === 'sale').length;
  const rentCount = listings.filter(l => l.dealType === 'rent').length;
  const dealTypeCountsData = [
    { name: 'Sotuv', value: saleCount, color: '#3b82f6' },
    { name: 'Ijara', value: rentCount, color: '#10b981' },
  ].filter(d => d.value > 0);

  const tashkentCityCount = listings.filter(l => l.regionId === 'tashkent-city').length;
  const tashkentRegionCount = listings.filter(l => l.regionId === 'tashkent-region').length;
  const samarkandCount = listings.filter(l => l.regionId === 'samarkand-region').length;

  return (
    <div className="space-y-6 text-white font-sans">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
        <h3 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" /> Tahlillar & Platforma Statistikasi
        </h3>
        <p className="text-[10px] text-white/50">Mulk turlari, moliyaviy tushumlar va hududiy ulush tahlili</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <span className="text-[9px] text-white/50 block uppercase font-medium">Jami tasdiqlangan</span>
          <h4 className="text-lg font-black text-emerald-400 mt-1">{approvedCount} ta mulk</h4>
          <span className="text-[9px] text-amber-400 block mt-0.5">⏳ {pendingCount} tasi moderatsiyada</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <span className="text-[9px] text-white/50 block uppercase font-medium">VIP / Premium</span>
          <h4 className="text-lg font-black text-amber-400 mt-1">{vipCount} VIP + {premiumCount} Prem</h4>
          <span className="text-[9px] text-white/40 block mt-0.5">bosh sahifadagi faollar</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <span className="text-[9px] text-white/50 block uppercase font-medium">Jami tushumlar</span>
          <h4 className="text-lg font-black text-white mt-1">${totalRevenue.toLocaleString()}</h4>
          <span className="text-[9px] text-emerald-400 block mt-0.5">Click, Payme va Uzum orqali</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <span className="text-[9px] text-white/50 block uppercase font-medium">Muloqotlar (Leads)</span>
          <h4 className="text-lg font-black text-blue-400 mt-1">{inquiries.length} ta so'rov</h4>
          <span className="text-[9px] text-blue-300 block mt-0.5">mijozlar aloqa so'rovlari</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Mulk Toifalari Ulushi */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase text-blue-400">Mulk toifalari bo'yicha e'lonlar</h4>
          {propertyTypeCountsData.length === 0 ? (
            <p className="text-xs text-white/40">Ma'lumotlar mavjud emas</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-[150px] w-[150px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeCountsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {propertyTypeCountsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 text-[10px]">
                {propertyTypeCountsData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></div>
                    <span className="font-bold text-white/70">{entry.name}:</span>
                    <span className="font-bold ml-auto font-mono text-white">{entry.value} ta ({Math.round((entry.value / listings.length) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Donut Chart: Kelishuv Turlari Split (Sale vs Rent) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase text-[#0082D5]">Sotish va Ijara ulushlari nisbati</h4>
          {dealTypeCountsData.length === 0 ? (
            <p className="text-xs text-white/40">Ma'lumotlar mavjud emas</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-[150px] w-[150px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealTypeCountsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={60}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {dealTypeCountsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 text-[10px]">
                {dealTypeCountsData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></div>
                    <span className="font-bold text-white/70">{entry.name === 'Sotuv' ? 'Sotish (Kvartira & Hovli)' : 'Ijara (Arenda)'}:</span>
                    <span className="font-bold ml-auto font-mono text-white">{entry.value} ta ({Math.round((entry.value / listings.length) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Bar Chart: Regions count */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-black uppercase text-amber-500">Viloyat va Hududlar kesimida e'lonlar soni</h4>
        <div className="h-[200px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Toshkent sh.', e_lonlar: tashkentCityCount },
                { name: 'Toshkent vil.', e_lonlar: tashkentRegionCount },
                { name: 'Samarqand vil.', e_lonlar: samarkandCount }
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
              <Bar dataKey="e_lonlar" name="E'lonlar soni" fill="#0082D5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
