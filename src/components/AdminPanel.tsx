/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Listing, Inquiry, Region, District, SubscriptionPlan, SubscriptionHistoryItem, SubscriptionTier } from '../types';

// Import modular tab components
import AdminDashboard from './admin/AdminDashboard';
import AdminListings from './admin/AdminListings';
import AdminInquiries from './admin/AdminInquiries';
import AdminBroadcast from './admin/AdminBroadcast';
import AdminConfig from './admin/AdminConfig';
import AdminSubscriptions from './admin/AdminSubscriptions';
import AdminTelegramBot from './admin/AdminTelegramBot';
import AdminVipBanners from './admin/AdminVipBanners';
import AdminStatistics from './admin/AdminStatistics';
import AdminStories from './admin/AdminStories';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';
import AdminLogs from './admin/AdminLogs';

interface AdminPanelProps {
  listings: Listing[];
  inquiries: Inquiry[];
  regions: Region[];
  districts: District[];
  plans: SubscriptionPlan[];
  subscriptionHistory: SubscriptionHistoryItem[];
  payments: any[];
  users?: any[];
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onTogglePremium: (id: string) => void;
  onProcessInquiry: (id: string) => void;
  onArchiveInquiry: (id: string) => void;
  onBroadcastMessage: (title: string, message: string) => void;
  onAddRegion: (name: string) => void;
  onAddDistrict: (regionId: string, name: string) => void;
  onEditPlanPrice: (planId: SubscriptionTier, newPrice: number) => void;
  onAddPlan: (name: string, price: number, durationDays: number, badge: string) => void;
  onActivateSubscription: (listingId: string, planId: SubscriptionTier) => void;
  onExtendSubscription: (listingId: string, days: number) => void;
  onExpireSubscription: (listingId: string) => void;
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string, reason: string) => void;
}

export default function AdminPanel({
  listings,
  inquiries,
  regions,
  districts,
  plans,
  subscriptionHistory,
  payments = [],
  users = [],
  onApproveListing,
  onRejectListing,
  onDeleteListing,
  onTogglePremium,
  onProcessInquiry,
  onArchiveInquiry,
  onBroadcastMessage,
  onAddRegion,
  onAddDistrict,
  onEditPlanPrice,
  onAddPlan,
  onActivateSubscription,
  onExtendSubscription,
  onExpireSubscription,
  onApprovePayment,
  onRejectPayment,
}: AdminPanelProps) {
  // Navigation State inside Admin
  const [adminTab, setAdminTab] = useState<'dashboard' | 'listings' | 'inquiries' | 'broadcast' | 'config' | 'subscriptions' | 'telegram' | 'banners' | 'statistics' | 'stories' | 'users' | 'reports' | 'logs'>('dashboard');

  // Telegram Bot Connection State
  const [botStatus, setBotStatus] = useState<'connected' | 'disconnected' | 'error' | 'loading'>('loading');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [botAppUrl, setBotAppUrl] = useState<string>('');
  const [botError, setBotError] = useState<string>('');

  // Subscription editing states
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanPrice, setEditingPlanPrice] = useState<number>(0);

  const fetchBotInfo = async () => {
    setBotStatus('loading');
    try {
      const res = await fetch('/api/bot-info');
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data.status);
        if (data.status === 'connected') {
          setBotInfo(data.botInfo);
          setBotAppUrl(data.appUrl);
        } else {
          setBotError(data.message || 'Xatolik yuz berdi');
        }
      } else {
        setBotStatus('error');
        setBotError('Serverdan noto\'g\'ri javob qaytdi.');
      }
    } catch (e: any) {
      setBotStatus('error');
      setBotError(e.message || 'Bog\'lanishda xatolik.');
    }
  };

  useEffect(() => {
    if (adminTab === 'telegram') {
      fetchBotInfo();
    }
  }, [adminTab]);

  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;
  const reportedCount = listings.filter(l => l.reportsCount > 0).length;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl text-white shadow-2xl min-h-[720px]">
      
      {/* Admin Panel Header */}
      <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight uppercase">SARA UYLAR • Boshqaruv Markazi</h2>
            <p className="text-[10px] text-white/50">Ko'chmas mulk va mijozlar muloqoti tahlili</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-bold">
          <button 
            onClick={() => setAdminTab('dashboard')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setAdminTab('listings')} 
            className={`px-3 py-1.5 rounded-lg transition-all relative cursor-pointer ${adminTab === 'listings' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            E'lonlar Moderatsiyasi
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setAdminTab('inquiries')} 
            className={`px-3 py-1.5 rounded-lg transition-all relative cursor-pointer ${adminTab === 'inquiries' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Aloqa So'rovlari
            {newInquiriesCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                {newInquiriesCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setAdminTab('broadcast')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'broadcast' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Ommaviy Xabar (Bot)
          </button>
          <button 
            onClick={() => setAdminTab('config')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'config' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            Hudud Sozlamalari
          </button>
          <button 
            onClick={() => setAdminTab('subscriptions')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'subscriptions' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            💳 Pullik Obunalar
          </button>
          <button 
            onClick={() => setAdminTab('telegram')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'telegram' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            🤖 Telegram Bot
          </button>
          <button 
            onClick={() => setAdminTab('banners')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'banners' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            🎪 VIP Bannerlar
          </button>
          <button 
            onClick={() => setAdminTab('statistics')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'statistics' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            📊 Tahlil & Statistika
          </button>
          <button 
            onClick={() => setAdminTab('stories')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'stories' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            🎬 Stories
          </button>
          <button 
            onClick={() => setAdminTab('users')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            👥 Foydalanuvchilar
          </button>
          <button 
            onClick={() => setAdminTab('reports')} 
            className={`px-3 py-1.5 rounded-lg transition-all relative cursor-pointer ${adminTab === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            ⚠️ Shikoyatlar
            {reportedCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                {reportedCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setAdminTab('logs')} 
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${adminTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
          >
            📟 Tizim Jurnallari
          </button>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {adminTab === 'dashboard' && (
          <AdminDashboard
            listings={listings}
            inquiries={inquiries}
            regions={regions}
          />
        )}

        {adminTab === 'listings' && (
          <AdminListings
            listings={listings}
            regions={regions}
            districts={districts}
            onApproveListing={onApproveListing}
            onRejectListing={onRejectListing}
            onDeleteListing={onDeleteListing}
            onTogglePremium={onTogglePremium}
          />
        )}

        {adminTab === 'inquiries' && (
          <AdminInquiries
            inquiries={inquiries}
            listings={listings}
            onProcessInquiry={onProcessInquiry}
            onArchiveInquiry={onArchiveInquiry}
          />
        )}

        {adminTab === 'broadcast' && (
          <AdminBroadcast
            onBroadcastMessage={onBroadcastMessage}
          />
        )}

        {adminTab === 'config' && (
          <AdminConfig
            regions={regions}
            districts={districts}
            onAddRegion={onAddRegion}
            onAddDistrict={onAddDistrict}
          />
        )}

        {adminTab === 'subscriptions' && (
          <AdminSubscriptions
            plans={plans}
            payments={payments}
            listings={listings}
            districts={districts}
            subscriptionHistory={subscriptionHistory}
            editingPlanId={editingPlanId}
            editingPlanPrice={editingPlanPrice}
            setEditingPlanId={setEditingPlanId}
            setEditingPlanPrice={setEditingPlanPrice}
            onEditPlanPrice={onEditPlanPrice}
            onAddPlan={onAddPlan}
            onApprovePayment={onApprovePayment}
            onRejectPayment={onRejectPayment}
            onActivateSubscription={onActivateSubscription}
            onExtendSubscription={onExtendSubscription}
            onExpireSubscription={onExpireSubscription}
          />
        )}

        {adminTab === 'telegram' && (
          <AdminTelegramBot
            botStatus={botStatus}
            botInfo={botInfo}
            botError={botError}
            botAppUrl={botAppUrl}
            fetchBotInfo={fetchBotInfo}
          />
        )}

        {adminTab === 'banners' && (
          <AdminVipBanners
            listings={listings}
            districts={districts}
            onActivateSubscription={onActivateSubscription}
            onExtendSubscription={onExtendSubscription}
            onExpireSubscription={onExpireSubscription}
          />
        )}

        {adminTab === 'statistics' && (
          <AdminStatistics
            listings={listings}
            payments={payments}
            inquiries={inquiries}
          />
        )}

        {adminTab === 'stories' && (
          <AdminStories />
        )}

        {adminTab === 'users' && (
          <AdminUsers 
            users={users} 
            onToggleVerifyUser={(telegramId, currentStatus) => {
              // Let parent or background poll refresh, or do an event trigger
            }}
          />
        )}

        {adminTab === 'reports' && (
          <AdminReports 
            listings={listings}
            districts={districts}
            onDeleteListing={onDeleteListing}
            onClearReports={(listingId) => {
              // Handled by API and auto-refresh
            }}
          />
        )}

        {adminTab === 'logs' && (
          <AdminLogs />
        )}
      </div>

    </div>
  );
}
