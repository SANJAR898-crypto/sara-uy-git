import React from 'react';
import { AlertTriangle, CheckCircle, Trash2, Eye, MapPin } from 'lucide-react';
import { Listing, District } from '../../types';

interface AdminReportsProps {
  listings: Listing[];
  districts: District[];
  onDeleteListing: (id: string) => void;
  onClearReports?: (id: string) => void; // Can call updateListing to set reportsCount = 0
}

export default function AdminReports({ 
  listings, 
  districts, 
  onDeleteListing,
  onClearReports 
}: AdminReportsProps) {
  const reportedListings = listings.filter(l => l.reportsCount > 0);

  const handleClearReports = async (listingId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportsCount: 0 })
      });
      if (res.ok) {
        if (onClearReports) {
          onClearReports(listingId);
        } else {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 text-white font-sans">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Shikoyat va Hisobotlar Boshqaruvi
            </h3>
            <p className="text-[10px] text-white/50">Foydalanuvchilar tomonidan spam yoki shubhali deb belgilangan e'lonlar</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2.5 max-w-xs shrink-0">
            <span className="text-xl">⚠️</span>
            <div className="text-[10px] font-semibold text-red-300">
              Faol shikoyatlar: <b className="text-white">{reportedListings.length} ta</b><br />
              Ta'sir: <b className="text-white">Avtomatik moderator nazorati</b>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          Ushbu bo'limda foydalanuvchilar xabar qilgan mulk e'lonlarini ko'rib chiqishingiz mumkin. Shikoyat soni yuqori bo'lgan e'lonlar xavfsizlik nuqtai nazaridan tekshirilishi kerak. E'lonni platformadan butunlay o'chirib yuborishingiz yoki asossiz bo'lsa shikoyatlarni tozalashingiz mumkin.
        </p>
      </div>

      {reportedListings.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center text-white/40">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-bold text-sm text-white">Shikoyatlar Mavjud Emas</h4>
          <p className="text-[10px] text-white/40 mt-1">Hozirgi vaqtda hech qaysi e'lon bo'yicha foydalanuvchilardan shikoyat kelib tushmagan. Ajoyib ko'rsatkich!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportedListings.map((listing) => {
            const district = districts.find(d => d.id === listing.districtId);
            return (
              <div key={listing.id} className="bg-white/5 border border-red-500/20 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-red-500/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500/20 border-b border-l border-red-500/30 text-red-400 font-mono text-[10px] font-black px-3.5 py-1.5 rounded-bl-xl uppercase tracking-widest animate-pulse flex items-center gap-1">
                  ⚠️ {listing.reportsCount} ta shikoyat
                </div>

                <div className="space-y-3.5">
                  <div className="aspect-video w-full rounded-xl bg-slate-800 border border-white/5 overflow-hidden">
                    <img 
                      src={listing.imageUrls[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80"} 
                      alt="listing img" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] bg-red-500/10 text-red-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-red-500/10 inline-block">
                      {listing.dealType === 'sale' ? 'Sotiladi' : 'Ijaraga'}
                    </span>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{listing.title}</h4>
                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white/30" />
                      {district ? district.name : listing.address}
                    </p>
                  </div>

                  <div className="bg-black/20 rounded-xl p-3 space-y-1 text-[10px] border border-white/5">
                    <div><b className="text-white/40">E'lon beruvchi:</b> <span className="text-white font-medium">{listing.ownerName}</span></div>
                    <div><b className="text-white/40">Telefon:</b> <span className="text-white/80 font-mono">{listing.ownerPhone}</span></div>
                    <div><b className="text-white/40">Telegram:</b> <span className="text-blue-400 font-mono">{listing.ownerTelegram}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleClearReports(listing.id)}
                    className="py-2.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Tasdiqlash
                  </button>
                  <button
                    onClick={() => onDeleteListing(listing.id)}
                    className="py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> O'chirish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
