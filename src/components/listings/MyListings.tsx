import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Listing, User as UserType } from '../../types';
import EmptyState from '../common/EmptyState';

interface MyListingsProps {
  listings: Listing[];
  currentUser: UserType & { phone?: string };
  onSelectListing?: (listing: Listing) => void;
}

export default function MyListings({
  listings,
  currentUser,
  onSelectListing
}: MyListingsProps) {
  
  const myFilteredListings = listings.filter(l => {
    const userUname = (currentUser.username || '').toLowerCase().replace('@', '');
    const userPhone = (currentUser.phone || currentUser.phoneNumber || '').replace(/[^0-9]/g, '');
    const userTgId = (currentUser.telegramId || '').toString();

    const listingUname = (l.ownerTelegram || '').toLowerCase().replace('@', '');
    const listingPhone = (l.ownerPhone || '').replace(/[^0-9]/g, '');

    return (userUname && listingUname === userUname) ||
           (userPhone && listingPhone === userPhone) ||
           (userTgId && listingUname === userTgId);
  });

  if (myFilteredListings.length === 0) {
    return (
      <div className="space-y-4 font-sans">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0082D5] border-b border-[#E2EAF8] pb-2">Mening e'lonlarim</h3>
        <EmptyState
          title="Siz hali e'lon bermagansiz"
          description={"\"Yangi e'lon berish\" bo'limi orqali o'z uyingizni soting yoki ijaraga bering."}
          icon={<PlusCircle className="w-8 h-8 text-[#0082D5]" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#0082D5] border-b border-[#E2EAF8] pb-2">Mening e'lonlarim</h3>

      <div className="space-y-3">
        {myFilteredListings.map(listing => (
          <div 
            key={listing.id} 
            onClick={() => onSelectListing?.(listing)}
            className="bg-white border border-[#E2EAF8] rounded-2xl p-3.5 space-y-3 shadow-xs cursor-pointer hover:border-blue-200 transition"
          >
            
            {/* Top status block */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold pb-2 border-b border-[#E2EAF8]">
              <span className="font-mono">ID: {listing.id.toUpperCase()}</span>
              {listing.status === 'pending' ? (
                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase text-[7px] font-black">Moderatsiyada</span>
              ) : listing.status === 'approved' ? (
                <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase text-[7px] font-black">Tasdiqlangan</span>
              ) : (
                <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full uppercase text-[7px] font-black">Rad etilgan</span>
              )}
            </div>

            {/* Info details row */}
            <div className="flex gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                <img src={listing.imageUrls[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{listing.title}</h4>
                <span className="text-xs font-black text-slate-900 font-mono">${listing.price.toLocaleString()}</span>
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">
                  Plan: {listing.plan?.toUpperCase() || 'STANDARD'} 
                  {listing.planExpiresAt && ` (Expires: ${new Date(listing.planExpiresAt).toLocaleDateString()})`}
                </span>
              </div>
            </div>

            {/* Stats counter */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold text-slate-500 py-1.5 border-y border-slate-50">
              <div className="bg-slate-50 rounded-lg p-1.5">
                <span>👁 Ko'rishlar soni:</span>
                <span className="text-[#0082D5] font-black ml-1 font-mono">{listing.viewsCount} ta</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-1.5">
                <span>★ Reyting:</span>
                <span className="text-[#0082D5] font-black ml-1 font-mono">{listing.rating}</span>
              </div>
            </div>

            {/* Upgrade CTA */}
            {listing.status === 'approved' && (
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5 font-sans">
                  <span className="text-[9px] text-blue-700 font-black block">🚀 E'lonni VIP yoki Istoriyaga ko'taring!</span>
                  <span className="text-[8px] text-slate-400 block leading-tight">Qidiruvda birinchi o'rin va 135% ko'proq mijozlar!</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectListing?.(listing);
                  }}
                  className="bg-[#0082D5] text-white text-[9px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-600 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  E'lonni ko'tarish
                </button>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
