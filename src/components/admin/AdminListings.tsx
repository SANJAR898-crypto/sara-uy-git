import React from 'react';
import { Trash2 } from 'lucide-react';
import { Listing, Region, District } from '../../types';

interface AdminListingsProps {
  listings: Listing[];
  regions: Region[];
  districts: District[];
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onTogglePremium: (id: string) => void;
}

export default function AdminListings({
  listings,
  regions,
  districts,
  onApproveListing,
  onRejectListing,
  onDeleteListing,
  onTogglePremium
}: AdminListingsProps) {
  const getDistrictName = (id: string) => {
    return districts.find(d => d.id === id)?.name || "Noma'lum tuman";
  };

  const getRegionName = (id: string) => {
    return regions.find(r => r.id === id)?.name || "Noma'lum viloyat";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Moderatsiya kutayotgan yoki tasdiqlangan e'lonlar</h3>
        <span className="text-[10px] text-white/50">{listings.length} ta umumiy e'lon</span>
      </div>

      {listings.length === 0 ? (
        <p className="text-xs text-white/40 italic text-center py-8">Tizimda e'lonlar mavjud emas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              
              {/* Thumbnail preview */}
              <div className="lg:col-span-2 h-20 w-full rounded-xl overflow-hidden bg-slate-800">
                <img src={listing.imageUrls[0]} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              {/* Meta info columns */}
              <div className="lg:col-span-6 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${listing.dealType === 'sale' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {listing.dealType === 'sale' ? 'SOTUV' : 'IJARA'}
                  </span>
                  <span className="text-[8px] font-bold bg-slate-800 text-white/80 px-1.5 py-0.5 rounded">
                    {listing.propertyType.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  {listing.status === 'pending' && (
                    <span className="text-[8px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded animate-pulse">
                      Moderatsiyada ⏳
                    </span>
                  )}
                  {listing.status === 'approved' && (
                    <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Efirda ✅
                    </span>
                  )}
                  {listing.status === 'rejected' && (
                    <span className="text-[8px] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                      Rad etilgan ❌
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white">{listing.title}</h4>
                <p className="text-[10px] text-white/50 flex items-center gap-1">
                  📍 {getRegionName(listing.regionId)} / {getDistrictName(listing.districtId)} • 📐 {listing.area} m² • {listing.rooms} xona
                </p>
                
                {/* Realtor contact metadata */}
                <p className="text-[9px] text-blue-300">
                  E'lon egasi: <b>{listing.ownerName}</b> ({listing.ownerPhone}) • <span className="underline">{listing.ownerTelegram}</span>
                </p>
              </div>

              {/* Listing configuration & pricing */}
              <div className="lg:col-span-2 text-right">
                <span className="text-sm font-black text-emerald-400 block">${listing.price.toLocaleString()}</span>
                {listing.isPremium ? (
                  <span className="text-[9px] text-amber-400 font-extrabold block">⭐ Premium</span>
                ) : (
                  <span className="text-[9px] text-white/40 block">Oddiy e'lon</span>
                )}
              </div>

              {/* Action moderation triggers */}
              <div className="lg:col-span-2 flex flex-wrap lg:flex-col gap-1 text-[10px]">
                {listing.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => onApproveListing(listing.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded font-bold transition flex items-center justify-center gap-0.5 cursor-pointer text-white"
                    >
                      Tasdiqlash
                    </button>
                    <button 
                      onClick={() => onRejectListing(listing.id)}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 rounded font-bold transition flex items-center justify-center gap-0.5 cursor-pointer text-white"
                    >
                      Rad etish
                    </button>
                  </>
                )}
                
                {listing.status === 'approved' && (
                  <button 
                    onClick={() => onTogglePremium(listing.id)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded font-bold transition flex items-center justify-center gap-1 text-amber-400 border border-amber-500/20 cursor-pointer"
                  >
                    ⭐ {listing.isPremium ? 'Oddiyga o\'tkazish' : 'Premium qilish'}
                  </button>
                )}

                <button 
                  onClick={() => onDeleteListing(listing.id)}
                  className="flex-1 py-1.5 bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40 rounded font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> O'chirish
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
