import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';

import { User as UserType } from '../../types';

interface VerifyPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserType & { phone?: string };
  onVerifyPhone?: (phone?: string) => void;
  onRefreshUser?: () => Promise<any>;
  setIsRefreshingUser?: (val: boolean) => void;
  botUsername?: string;
}

export default function VerifyPhoneModal({
  isOpen,
  onClose,
  currentUser,
  onVerifyPhone,
  onRefreshUser,
  setIsRefreshingUser,
  botUsername
}: VerifyPhoneModalProps) {
  if (!isOpen) return null;

  const handleCheckVerification = async () => {
    if (onRefreshUser) {
      if (setIsRefreshingUser) setIsRefreshingUser(true);
      try {
        console.log(`[CLIENT LOG] Checking verification for Telegram user.id: ${currentUser?.telegramId}`);
        const updated = await onRefreshUser();
        
        const storedId = updated?.telegramId || updated?.id;
        const phoneVerifiedVal = updated?.phone_verified;
        const phoneFoundVal = updated?.phone || updated?.phoneNumber;
        
        console.log(`[CLIENT LOG] Stored user.id in database: ${storedId}`);
        console.log(`[CLIENT LOG] phone_verified value: ${phoneVerifiedVal}`);
        console.log(`[CLIENT LOG] Phone number found: ${phoneFoundVal}`);
        console.log(`[CLIENT LOG] API response user object:`, updated);

        const hasVerifiedPhone = phoneVerifiedVal || (phoneFoundVal && phoneFoundVal.trim() !== '' && phoneFoundVal !== '+998 90 000 00 00');
        if (hasVerifiedPhone) {
          onClose();
        } else {
          alert("Raqam hali tasdiqlanmadi. Iltimos, Telegram botda telefon raqamingizni yuboring va keyin qayta urunib ko'ring.");
        }
      } catch (e) {
        console.error("[CLIENT LOG] Error during verification status check:", e);
      } finally {
        if (setIsRefreshingUser) setIsRefreshingUser(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="bg-white border border-[#E2EAF8] rounded-3xl w-full max-w-sm p-5 shadow-2xl relative flex flex-col gap-4 text-center"
      >
        {/* Close button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center mx-auto text-[#0082D5] shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Telefon Raqamini Tasdiqlash</h3>
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest text-[#0082D5]">Sara Uylar Xavfsizlik Tizimi</p>
        </div>

        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          Tizimda e'lon joylashtirish va brokerlik xizmatlaridan foydalanish uchun telefon raqamingizni Telegram bot orqali tasdiqlash talab etiladi.
        </p>

        {/* Step-by-Step Flow */}
        <div className="bg-slate-50 border border-[#E2EAF8] rounded-2xl p-3 text-left space-y-2.5">
          <div className="flex gap-2.5 items-start">
            <span className="bg-[#0082D5] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">1</span>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-800 block">Botga o'ting</span>
              <span className="text-[8px] text-slate-400 block leading-tight">Quyidagi "🤖 Telegram Botni Ochish" tugmasini bosing va botni tasdiqlash rejimida ishga tushiring.</span>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <span className="bg-[#0082D5] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">2</span>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-800 block">Kontaktni ulashing</span>
              <span className="text-[8px] text-slate-400 block leading-tight">Bot menyusidagi "📞 Raqamni yuborish" tugmasini bosing.</span>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <span className="bg-[#0082D5] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">3</span>
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-800 block">Tekshiring</span>
              <span className="text-[8px] text-slate-400 block leading-tight">Ilovaga qaytib, pastdagi "🔄 Tasdiqlashni tekshirish" tugmasini bosing.</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <a 
            href={`https://t.me/${botUsername || 'SaraUylarBot'}?start=verify_phone`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-[#0082D5] hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
          >
            🤖 Telegram Botni Ochish
          </a>

          <button
            type="button"
            onClick={handleCheckVerification}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            🔄 Tasdiqlashni tekshirish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
