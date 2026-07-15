import React from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import { Listing, User as UserType } from '../../types';

interface ContactModalProps {
  contactType: 'call' | 'telegram' | 'whatsapp' | null;
  onClose: () => void;
  currentUser: UserType & { phone?: string };
  listing: Listing;
  contactMessage: string;
  setContactMessage: (val: string) => void;
  contactSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ContactModal({
  contactType,
  onClose,
  currentUser,
  listing,
  contactMessage,
  setContactMessage,
  contactSuccess,
  onSubmit
}: ContactModalProps) {
  if (!contactType) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="absolute inset-x-0 bottom-0 bg-white border-t border-slate-100 rounded-t-[24px] p-4 space-y-4 z-50 shadow-2xl text-slate-800 font-sans"
    >
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
          Sotuvchi bilan bog'lanish ({contactType.toUpperCase()})
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {contactSuccess ? (
        <div className="py-6 text-center space-y-2 text-emerald-600">
          <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
          <h4 className="font-bold text-xs">Murojaatingiz yuborildi!</h4>
          <p className="text-[9px] text-slate-400">
            Sotuvchiga so'rov muvaffaqiyatli yetkazildi. "So'rovlar" sahifasida kuzatishingiz mumkin.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-0.5">
            <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Foydalanuvchi ismingiz</label>
            <input 
              type="text" 
              value={currentUser.fullName}
              disabled
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-[11px] text-slate-500 font-bold"
            />
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Aloqa telefoningiz</label>
            <input 
              type="text" 
              value={currentUser.phone || currentUser.phoneNumber || ''}
              disabled
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-[11px] text-slate-500 font-bold"
            />
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Aloqa xabar matni</label>
            <textarea 
              rows={3}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-slate-300 font-medium"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[11px] font-bold transition-all duration-300 shadow-md cursor-pointer"
          >
            Murojaatni yuborish ➔
          </button>
        </form>
      )}
    </motion.div>
  );
}
