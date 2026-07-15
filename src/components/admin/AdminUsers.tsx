import React, { useState } from 'react';
import { Search, UserCheck, Check, ShieldAlert, BadgeHelp, Eye, Users } from 'lucide-react';
import { User, SubscriptionTier } from '../../types';

interface AdminUsersProps {
  users: any[];
  onToggleVerifyUser?: (telegramId: string, currentStatus: boolean) => void;
}

export default function AdminUsers({ users, onToggleVerifyUser }: AdminUsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'vip' | 'premium' | 'standard'>('all');
  const [verifyFilter, setVerifyFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const totalUsers = users.length;
  const verifiedCount = users.filter(u => u.isVerifiedSeller).length;
  const vipCount = users.filter(u => u.packageId === 'vip').length;
  const premiumCount = users.filter(u => u.packageId === 'premium').length;

  const handleToggleVerify = async (telegramId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${telegramId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerifiedSeller: !currentStatus })
      });
      if (res.ok) {
        if (onToggleVerifyUser) {
          onToggleVerifyUser(telegramId, !currentStatus);
        } else {
          // If parent doesn't have local sync, we rely on polling
          window.location.reload();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telegramId || '').toString().includes(searchTerm);
    
    const matchesTier = tierFilter === 'all' || user.packageId === tierFilter;
    const matchesVerify = 
      verifyFilter === 'all' ||
      (verifyFilter === 'verified' && user.isVerifiedSeller) ||
      (verifyFilter === 'unverified' && !user.isVerifiedSeller);

    return matchesSearch && matchesTier && matchesVerify;
  });

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Jami foydalanuvchilar</span>
            <h3 className="text-xl font-black text-white mt-1">{totalUsers} ta</h3>
            <span className="text-[9px] text-blue-400 block mt-0.5">tizimda ro'yxatdan o'tgan</span>
          </div>
          <div className="w-10 h-10 bg-blue-600/15 border border-blue-500/20 rounded-xl flex items-center justify-center text-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Tasdiqlanganlar</span>
            <h3 className="text-xl font-black text-emerald-400 mt-1">{verifiedCount} ta</h3>
            <span className="text-[9px] text-emerald-400 block mt-0.5">ishonchli broker / egalari</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center text-lg">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">VIP Obunachilar</span>
            <h3 className="text-xl font-black text-amber-400 mt-1">{vipCount} ta</h3>
            <span className="text-[9px] text-amber-400 block mt-0.5">💎 VIP faol tarif</span>
          </div>
          <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center text-lg">👑</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest block font-medium">Premium Obunachilar</span>
            <h3 className="text-xl font-black text-sky-400 mt-1">{premiumCount} ta</h3>
            <span className="text-[9px] text-sky-400 block mt-0.5">⭐ Premium faol tarif</span>
          </div>
          <div className="w-10 h-10 bg-sky-500/15 border border-sky-500/20 rounded-xl flex items-center justify-center text-lg">⭐</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Ism, telefon, username yoki Telegram ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Tarif:</span>
            <select
              value={tierFilter}
              onChange={(e: any) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Barchasi</option>
              <option value="vip">💎 VIP</option>
              <option value="premium">⭐ Premium</option>
              <option value="standard">⚙️ Standard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Tasdiq:</span>
            <select
              value={verifyFilter}
              onChange={(e: any) => setVerifyFilter(e.target.value)}
              className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Barchasi</option>
              <option value="verified">🟢 Tasdiqlanganlar</option>
              <option value="unverified">🔴 Tasdiqlanmaganlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table / Directory */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-white/50 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-4 font-bold text-[10px]">Foydalanuvchi</th>
                <th className="px-5 py-4 font-bold text-[10px]">Telegram Username / ID</th>
                <th className="px-5 py-4 font-bold text-[10px]">Telefon Raqam</th>
                <th className="px-5 py-4 font-bold text-[10px]">Tarif (Obuna)</th>
                <th className="px-5 py-4 font-bold text-[10px]">Rol / Tasdiq</th>
                <th className="px-5 py-4 font-bold text-[10px] text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40">
                    <BadgeHelp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Kechirasiz, qidiruv bo'yicha hech qanday foydalanuvchi topilmadi.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id || user.telegramId} className="hover:bg-white/2 transition-colors">
                    {/* User profile details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=0082D5&color=fff`}
                          alt="avatar"
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl border border-white/10 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-white text-xs">{user.fullName || 'Sara User'}</h4>
                          <span className="text-[10px] text-white/40">Qo'shildi: {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Noma\'lum'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Telegram username / ID */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="text-blue-400 font-medium font-mono">{user.username || '@username_yoq'}</div>
                        <div className="text-[10px] text-white/40 font-mono">ID: {user.telegramId}</div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-5 py-4 font-mono text-slate-300">
                      {user.phoneNumber ? user.phoneNumber : (
                        <span className="text-white/20 italic">Ulanmagan</span>
                      )}
                    </td>

                    {/* Package */}
                    <td className="px-5 py-4">
                      {user.packageId === 'vip' ? (
                        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                          💎 VIP STATUS
                        </div>
                      ) : user.packageId === 'premium' ? (
                        <div className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                          ⭐ PREMIUM
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-white/50 px-2.5 py-1 rounded-lg font-medium text-[10px]">
                          ⚙️ Standart
                        </div>
                      )}
                    </td>

                    {/* Verified Status */}
                    <td className="px-5 py-4">
                      {user.isVerifiedSeller ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          🟢 Tasdiqlangan mulkdor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-white/40 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-[9px]">
                          ⚪ Oddiy sotuvchi
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleVerify(user.telegramId, !!user.isVerifiedSeller)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                          user.isVerifiedSeller 
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25' 
                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                        }`}
                      >
                        {user.isVerifiedSeller ? 'Tasdiqni Bekor Qilish' : 'Tasdiqlash'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
