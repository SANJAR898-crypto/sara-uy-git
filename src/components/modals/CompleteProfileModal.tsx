import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, User, Phone, CheckCircle, RefreshCw } from 'lucide-react';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onRefreshUser: () => Promise<any>;
  onSaveProfile: (fullName: string) => Promise<void>;
  actionName?: string;
  onSuccess?: () => void;
  botUsername?: string;
}

export default function CompleteProfileModal({
  isOpen,
  onClose,
  currentUser,
  onRefreshUser,
  onSaveProfile,
  actionName = "Himoyalangan amal",
  onSuccess,
  botUsername
}: CompleteProfileModalProps) {
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.fullName) {
      setFullName(currentUser.fullName);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const hasPhone = currentUser?.phone || currentUser?.phoneNumber || currentUser?.phone_verified;

  const handleCheckPhone = async () => {
    setChecking(true);
    setError(null);
    try {
      console.log(`[CLIENT LOG] Checking verification for Telegram user.id: ${currentUser?.telegramId}`);
      const updatedUser = await onRefreshUser();
      
      const storedId = updatedUser?.telegramId || updatedUser?.id;
      const phoneVerifiedVal = updatedUser?.phone_verified;
      const phoneFoundVal = updatedUser?.phone || updatedUser?.phoneNumber;
      
      console.log(`[CLIENT LOG] Stored user.id in database: ${storedId}`);
      console.log(`[CLIENT LOG] phone_verified value: ${phoneVerifiedVal}`);
      console.log(`[CLIENT LOG] Phone number found: ${phoneFoundVal}`);
      console.log(`[CLIENT LOG] API response user object:`, updatedUser);

      if (phoneVerifiedVal || (phoneFoundVal && phoneFoundVal.trim() !== '')) {
        setSuccessMsg("Telefon raqamingiz muvaffaqiyatli tasdiqlandi!");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } else {
        setError("Raqam hali tasdiqlanmadi. Iltimos, Telegram botda telefon raqamingizni ulashing va qayta tekshiring.");
      }
    } catch (err: any) {
      console.error("[CLIENT LOG] Error checking phone verification:", err);
      setError("Tekshirishda xatolik yuz berdi. Iltimos, qayta urunib ko'ring.");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError("Iltimos, to'liq ismingizni kiriting.");
      return;
    }

    if (!hasPhone) {
      setError("Iltimos, avval telefon raqamingizni Telegram bot orqali tasdiqlang.");
      return;
    }

    setIsVerifying(true);
    try {
      await onSaveProfile(fullName);
      setSuccessMsg("Profil muvaffaqiyatli to'ldirildi!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError("Profilni saqlashda xatolik yuz berdi.");
    } finally {
      setIsVerifying(false);
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
        className="bg-white border border-[#E2EAF8] rounded-3xl w-full max-w-sm p-5 shadow-2xl relative flex flex-col gap-4"
      >
        {/* Close button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#0082D5]/10 border-2 border-[#0082D5]/20 flex items-center justify-center mx-auto text-[#0082D5] shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Profilni To'ldirish</h3>
          <span className="inline-block text-[9px] bg-amber-500/10 text-amber-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {actionName}
          </span>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium pt-2">
            Ushbu amalni bajarish uchun to'liq ismingizni kiritishingiz va telefon raqamingizni tasdiqlashingiz talab etiladi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> To'liq Ism (F.I.O)
            </label>
            <input 
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Shaxzod Alimov"
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 focus:border-[#0082D5] focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
              required
            />
          </div>

          {/* Phone Verification Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefon Raqam
            </label>

            {hasPhone ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tasdiqlangan: <span className="font-mono">{currentUser.phone || currentUser.phoneNumber}</span></span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                  Raqamingiz tasdiqlanmagan. Iltimos, Telegram botimiz orqali uni tasdiqlang.
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href={`https://t.me/${botUsername || 'SaraUylarBot'}?start=verify_phone`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 bg-[#0082D5] hover:bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-blue-500/10 text-center"
                  >
                    🤖 Botni ochish
                  </a>
                  <button
                    type="button"
                    onClick={handleCheckPhone}
                    disabled={checking}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition disabled:opacity-50"
                  >
                    {checking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '🔄 Tasdiqni tekshirish'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {error && (
            <p className="text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 p-2.5 rounded-xl text-center">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center">
              {successMsg}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isVerifying || !fullName.trim() || !hasPhone}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/10 transition disabled:opacity-40 cursor-pointer"
            >
              {isVerifying ? 'Saqlanmoqda...' : 'Saqlash va davom etish'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
