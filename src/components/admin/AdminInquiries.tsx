import React from 'react';
import { Inquiry, Listing } from '../../types';

interface AdminInquiriesProps {
  inquiries: Inquiry[];
  listings: Listing[];
  onProcessInquiry: (id: string) => void;
  onArchiveInquiry: (id: string) => void;
}

export default function AdminInquiries({
  inquiries,
  listings,
  onProcessInquiry,
  onArchiveInquiry
}: AdminInquiriesProps) {
  const totalInquiries = inquiries.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Aloqa va uchrashuv so'rovlari (CRM Leads)</h3>
        <span className="text-[10px] text-white/50">Hammasi: {totalInquiries} ta</span>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center text-white/40 italic">
          Hozircha mijoz so'rovlari mavjud emas.
        </div>
      ) : (
        <div className="space-y-3">
          {[...inquiries].reverse().map(inq => {
            const listingObj = listings.find(l => l.id === inq.listingId);
            return (
              <div key={inq.id} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white/40">ID: {inq.id.toUpperCase()}</span>
                    <span className="text-blue-400 font-extrabold uppercase bg-blue-500/10 px-1.5 py-0.5 rounded tracking-widest text-[8px]">
                      {inq.contactType} via bot
                    </span>
                  </div>
                  <div>
                    {inq.status === 'new' ? (
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">Yangi so'rov</span>
                    ) : inq.status === 'processed' ? (
                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold">Bajarildi</span>
                    ) : (
                      <span className="bg-white/10 text-white/40 px-2 py-0.5 rounded-full">Arxivlandi</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4 space-y-1 text-xs">
                    <span className="text-[9px] text-white/40 uppercase block">Aloqa ma'lumotlari:</span>
                    <p className="font-black text-white">{inq.userName}</p>
                    <p className="text-blue-300 font-bold">{inq.userPhone}</p>
                    <p className="text-white/40 font-mono text-[10px]">{inq.userId}</p>
                  </div>
                  <div className="md:col-span-5 space-y-1 text-xs">
                    <span className="text-[9px] text-white/40 uppercase block">Qiziqqan e'loni:</span>
                    {listingObj ? (
                      <div>
                        <p className="font-bold text-white line-clamp-1">{listingObj.title}</p>
                        <p className="text-emerald-400 font-bold">${listingObj.price.toLocaleString()} • {listingObj.dealType.toUpperCase()}</p>
                      </div>
                    ) : (
                      <p className="text-red-400 italic">O'chirilgan yoki topilmagan e'lon</p>
                    )}
                  </div>
                  <div className="md:col-span-3 text-right">
                    <span className="text-[9px] text-white/40 block">Yuborilgan vaqt:</span>
                    <span className="text-[10px] font-mono">{new Date(inq.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Message details */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-xs text-white/80 italic leading-relaxed">
                  "{inq.message}"
                </div>

                {/* CRM Actions */}
                <div className="flex justify-end gap-2 text-[10px]">
                  {inq.status === 'new' && (
                    <button 
                      onClick={() => onProcessInquiry(inq.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow cursor-pointer"
                    >
                      ✓ Bajarildi deb belgilash
                    </button>
                  )}
                  {inq.status !== 'archived' && (
                    <button 
                      onClick={() => onArchiveInquiry(inq.id)}
                      className="px-3 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 font-bold rounded-lg cursor-pointer"
                    >
                      📥 Arxivlash
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
