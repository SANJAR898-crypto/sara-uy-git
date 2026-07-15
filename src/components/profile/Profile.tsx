import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Listing, User as UserType } from '../../types';

interface ProfileProps {
  currentUser: UserType & { phone?: string };
  listings: Listing[];
  favorites?: string[];
  onVerifyPhone?: () => void;
  onBuyPackage?: (planId: 'standard' | 'premium' | 'vip' | any) => void;
  onVerifyClick?: () => void;
  onBuyPackageClick?: (planId: 'standard' | 'premium' | 'vip' | any) => void;
}

export default function Profile({
  currentUser,
  listings,
  favorites = [],
  onVerifyPhone,
  onBuyPackage,
  onVerifyClick,
  onBuyPackageClick
}: ProfileProps) {
  const handleVerifyPhone = onVerifyPhone || onVerifyClick || (() => {});
  const handleBuyPackage = onBuyPackage || onBuyPackageClick || (() => {});
  
  const userListingsCount = listings.filter(l => {
    const userUname = (currentUser.username || '').toLowerCase().replace('@', '');
    const userPhone = (currentUser.phone || currentUser.phoneNumber || '').replace(/[^0-9]/g, '');
    const userTgId = (currentUser.telegramId || '').toString();

    const listingUname = (l.ownerTelegram || '').toLowerCase().replace('@', '');
    const listingPhone = (l.ownerPhone || '').replace(/[^0-9]/g, '');

    return (userUname && listingUname === userUname) ||
           (userPhone && listingPhone === userPhone) ||
           (userTgId && listingUname === userTgId);
  }).length;

  const daysLeft = currentUser.packageExpiresAt 
    ? Math.max(0, Math.ceil((new Date(currentUser.packageExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 'Cheksiz';
  
  const isSubscriptionActive = currentUser.packageExpiresAt && new Date(currentUser.packageExpiresAt).getTime() > Date.now();

  let maxListings = 1;
  if (isSubscriptionActive) {
    if (currentUser.packageId === 'standard') maxListings = 5;
    else if (currentUser.packageId === 'premium') maxListings = 10;
    else if (currentUser.packageId === 'vip') maxListings = 50;
  }

  const listingsRemaining = (!isSubscriptionActive || currentUser.packageId === 'vip') 
    ? 'Cheksiz' 
    : Math.max(0, maxListings - userListingsCount);

  const isVerifiedSeller = currentUser.isVerifiedSeller || (currentUser.phoneNumber && currentUser.phoneNumber !== '+998 90 000 00 00' && currentUser.phoneNumber.trim() !== '');

  return (
    <div className="space-y-4 font-sans">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Mening profilim</h3>
      
      {/* User profile card */}
      <div className="bg-white border border-slate-200/50 rounded-2xl p-4 text-center space-y-3 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center border border-slate-100 overflow-hidden shadow-2xs">
          <img src={currentUser.avatarUrl || "https://ui-avatars.com/api/?name=Guest&background=0082D5&color=fff"} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-950">{currentUser.fullName || "Mehmon"}</h4>
          <p className="text-[10px] text-slate-400 font-bold">{currentUser.username || "Guest"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-50 font-bold">
          <div className="bg-slate-50 p-2.5 rounded-xl col-span-2">
            <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Sevimlilarim</span>
            <span className="text-xs font-bold text-red-500 font-mono">{favorites.length} ta</span>
          </div>
        </div>
      </div>

      {!isVerifiedSeller ? (
        /* GUEST LIGHTWEIGHT PROFILE VIEW */
        <>
          {/* Become Seller Call-to-Action Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md text-white text-left relative overflow-hidden">
            {/* Ambient subtle light glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0082D5]/10 rounded-full blur-2xl" />
            
            <div className="space-y-1 relative z-10">
              <span className="text-[8px] bg-[#0082D5]/20 text-[#38bdf8] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#0082D5]/30">
                📢 SOTUVCHI BO'LISH
              </span>
              <h4 className="text-xs font-bold pt-1.5 text-slate-100">Uyingizni soting yoki ijaraga bering!</h4>
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                SARA UYLAR platformasida broker yoki mulk egasi sifatida ro'yxatdan o'ting, e'lonlar joylang va mijozlardan qo'ng'iroqlarni qabul qiling.
              </p>
            </div>

            <button
              type="button"
              onClick={handleVerifyPhone}
              className="w-full bg-[#0082D5] hover:bg-blue-600 text-white font-bold text-[10px] py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-500/10 uppercase tracking-wider relative z-10"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Sotuvchi bo'lish (Become Seller)
            </button>
          </div>

          {/* Profile specifications list (Guest mode) */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-3.5 space-y-2.5 text-[10px] shadow-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Telegram ID:</span>
              <span className="font-bold text-slate-800 font-mono">{currentUser.telegramId || "Mehmon"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Username:</span>
              <span className="font-bold text-slate-800">{currentUser.username || "Mavjud emas"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Profil holati (Status):</span>
              <span className="text-slate-400 font-bold">Mehmon (Guest)</span>
            </div>
            <div className="flex justify-between py-1.5 items-center">
              <span className="text-slate-400 font-bold">Ilova tili:</span>
              <span className="font-bold text-slate-800">O'zbekcha (UZ) 🇺🇿</span>
            </div>
          </div>
        </>
      ) : (
        /* VERIFIED SELLER / BROKER PROFILE VIEW */
        <>
          {/* 📋 Subscriptions Package Details */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-4 space-y-3 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex justify-between">
              <span>📋 Tarif obunasi</span>
              <span className="text-slate-900">Faol</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2.5">
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wide mb-0.5">Tarifingiz</span>
                <span className="text-xs font-bold text-slate-800 uppercase">
                  {isSubscriptionActive 
                    ? (currentUser.packageId === 'vip' ? '🥇 VIP' : currentUser.packageId === 'premium' ? '🥈 Premium' : '🥉 Standard')
                    : '🎫 Bepul Sinov'
                  }
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2.5">
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wide mb-0.5">Qolgan kunlar</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {daysLeft === 'Cheksiz' || !isSubscriptionActive ? 'Muddatsiz' : `${daysLeft} kun`}
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2.5 col-span-2 flex justify-between items-center px-4 py-3">
                <div className="text-left space-y-0.5">
                  <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wide">Qolgan e'lonlar limiti</span>
                  <span className="text-[11px] font-bold text-slate-800">
                    {listingsRemaining === 'Cheksiz' ? "Cheksiz e'lon" : `${listingsRemaining} ta e'lon`}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-bold font-mono bg-slate-200/50 px-2.5 py-1 rounded-full">
                  Jami: {userListingsCount}/{currentUser.packageId === 'vip' ? '50' : currentUser.packageId === 'premium' ? '10' : currentUser.packageId === 'standard' ? '5' : '1'}
                </span>
              </div>
            </div>

            {!isSubscriptionActive ? (
              <div className="space-y-2 text-left">
                <div className="bg-amber-50 border border-amber-150 rounded-xl p-3 text-[10px] text-amber-800 leading-normal font-semibold">
                  ⚠️ Siz hozirda Bepul Sinov tarifidasiz (limit: 1 ta e'lon). Yangi e'lonlar joylash uchun quyidagi tariflardan birini faollashtiring:
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleBuyPackage('standard')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[9.5px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition text-center"
                  >
                    🥉 Standard Broker ($5 / oy)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyPackage('premium')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[9.5px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition text-center"
                  >
                    🥈 Premium Broker ($19 / oy)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyPackage('vip')}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9.5px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition text-center"
                  >
                    🥇 VIP Eksklyuziv ($49 / oy)
                  </button>
                </div>
              </div>
            ) : currentUser.packageId === 'standard' ? (
              <div className="space-y-2 text-left">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-700 leading-normal font-semibold">
                  🥉 Siz Standard Broker tarifidasiz (limit: 5 ta e'lon). Ko'proq e'lonlar berish uchun professional tariflarga o'ting:
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuyPackage('premium')}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition"
                  >
                    🥈 Premium ($19)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyPackage('vip')}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition"
                  >
                    🥇 VIP ($49)
                  </button>
                </div>
              </div>
            ) : currentUser.packageId === 'premium' ? (
              <div className="space-y-2 text-left">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-700 leading-normal font-semibold">
                  🥈 Siz Premium broker tarifidasiz (limit: 10 ta e'lon). Eng yuqori imtiyozli VIP tarifga o'tishni xohlaysizmi?
                </div>
                <button
                  type="button"
                  onClick={() => handleBuyPackage('vip')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition"
                >
                  🥇 VIP tarifiga o'tish ($49)
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] text-emerald-800 leading-normal font-semibold text-left">
                👑 Siz eng yuqori VIP Eksklyuziv tarifdasiz! Cheksiz imtiyozlar va 50 ta e'lon berish limitiga egasiz.
              </div>
            )}
          </div>

          {/* Profile specifications list (Seller mode) */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-3.5 space-y-2.5 text-[10px] shadow-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Ism (First Name):</span>
              <span className="font-bold text-slate-800">{currentUser.firstName || currentUser.fullName.split(' ')[0] || "Noma'lum"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Familiya (Last Name):</span>
              <span className="font-bold text-slate-800">{currentUser.lastName || currentUser.fullName.split(' ').slice(1).join(' ') || "Mavjud emas"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Telegram ID:</span>
              <span className="font-bold text-slate-800 font-mono">{currentUser.telegramId || "Noma'lum"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Username:</span>
              <span className="font-bold text-slate-800">{currentUser.username || "Mavjud emas"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Telegram Premium:</span>
              <span className="font-bold text-slate-800">{currentUser.isTelegramPremium ? "👑 Premium" : "Oddiy"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Telegram tili (Language):</span>
              <span className="font-bold text-slate-800 font-mono uppercase">{currentUser.languageCode || "UZ"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Profil rasmi:</span>
              <span className="font-bold text-slate-800">{currentUser.avatarUrl ? "✅ Yuklangan" : "❌ Yo'q"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Telefon raqam:</span>
              <span className="font-bold text-slate-800">{currentUser.phoneNumber || currentUser.phone || "Kiritilmagan"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-bold">Profil holati:</span>
              <span className="text-slate-900 font-bold">
                {currentUser.isVerifiedSeller ? "✓ Tasdiqlangan Broker" : "✓ Oddiy foydalanuvchi"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 items-center">
              <span className="text-slate-400 font-bold">Ilova tili:</span>
              <span className="font-bold text-slate-800">O'zbekcha (UZ) 🇺🇿</span>
            </div>
          </div>
        </>
      )}

      {/* Support section info */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1 text-slate-800 shadow-2xs">
        <span className="text-xs font-bold block">Yordam & Aloqa</span>
        <p className="text-[9px] text-slate-500 leading-normal">
          Platforma bo'yicha savollaringiz yoki takliflaringiz bo'lsa, istalgan vaqtda Sara Uylar qo'llab-quvvatlash botiga murojaat qiling:
        </p>
        <span className="text-[10px] font-bold block pt-1 hover:underline">Support Telegram: @SaraUylar_Support</span>
      </div>
    </div>
  );
}
