import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { User as UserType } from '../../types';

interface BuyPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: 'standard' | 'premium' | 'vip' | null;
  currentUser: UserType & { phone?: string };
  onAddPayment: (payload: any) => Promise<any>;
  onRefreshUser?: () => Promise<any>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BuyPackageModal({
  isOpen,
  onClose,
  selectedPackage,
  currentUser,
  onAddPayment,
  onRefreshUser,
  activeTab,
  setActiveTab
}: BuyPackageModalProps) {
  
  const [buyPaymentStep, setBuyPaymentStep] = useState<'provider_select' | 'card_input' | 'sms_input' | 'success'>('provider_select');
  const [buySelectedProvider, setBuySelectedProvider] = useState<'click' | 'payme' | 'uzum'>('click');
  const [buyCardNumber, setBuyCardNumber] = useState('');
  const [buyCardExpiry, setBuyCardExpiry] = useState('');
  const [buySmsCode, setBuySmsCode] = useState('');

  if (!isOpen || !selectedPackage) return null;

  const handleProviderSelect = (provider: 'click' | 'payme' | 'uzum') => {
    setBuySelectedProvider(provider);
    setBuyPaymentStep('card_input');
  };

  const handleBuyCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buyCardNumber.replace(/\s+/g, '').length < 16) {
      alert("Iltimos, 16 xonali karta raqamini kiriting!");
      return;
    }
    if (buyCardExpiry.length < 5) {
      alert("Amal qilish muddatini kiriting (MM/YY)!");
      return;
    }
    setBuyPaymentStep('sms_input');
  };

  const handleBuySmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buySmsCode.length < 5) {
      alert("Iltimos, 5 xonali SMS kodni kiriting!");
      return;
    }

    const amount = selectedPackage === 'vip' ? 49 : selectedPackage === 'premium' ? 19 : 5;
    
    const paymentPayload = {
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone || currentUser.phoneNumber || '',
      packageId: selectedPackage,
      amount,
      paymentMethod: buySelectedProvider || 'click'
    };

    try {
      await onAddPayment(paymentPayload);
      
      if (onRefreshUser) {
        await onRefreshUser();
      }
      
      setBuyPaymentStep('success');
      setTimeout(() => {
        onClose();
        setBuyPaymentStep('provider_select');
        setBuyCardNumber('');
        setBuyCardExpiry('');
        setBuySmsCode('');
        
        if (activeTab !== 'add_listing') {
          setActiveTab('profile');
        }
      }, 2500);
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi, iltimos qaytadan urinib ko'ring.");
    }
  };

  const handleModalClose = () => {
    onClose();
    setBuyPaymentStep('provider_select');
    setBuyCardNumber('');
    setBuyCardExpiry('');
    setBuySmsCode('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[24px] p-5 shadow-2xl border border-[#E2EAF8] flex flex-col max-h-[90vh] overflow-y-auto text-slate-800"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
            {selectedPackage === 'vip' ? '👑 VIP Paketi Checkout' : selectedPackage === 'premium' ? '⚡ Premium Paketi Checkout' : '🥉 Standard Paketi Checkout'}
          </h4>
          <button 
            onClick={handleModalClose}
            className="w-7 h-7 bg-slate-50 border border-[#E2EAF8] text-slate-500 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="bg-[#0082D5]/5 border border-[#0082D5]/10 rounded-xl p-3 flex justify-between items-center mb-4">
          <div>
            <span className="text-[8px] text-slate-400 block font-black uppercase tracking-wide">Tanlangan tarif</span>
            <span className="text-[11px] font-black text-[#0082D5] uppercase">
              {selectedPackage === 'vip' ? '👑 VIP Eksklyuziv (50 e\'lon)' : selectedPackage === 'premium' ? '⚡ Premium Broker (10 e\'lon)' : '🥉 Standard Broker (5 e\'lon)'}
            </span>
          </div>
          <span className="text-sm font-black text-slate-900 font-mono">
            ${selectedPackage === 'vip' ? '49' : selectedPackage === 'premium' ? '19' : '5'}
          </span>
        </div>

        {/* Step 1: Provider Select */}
        {buyPaymentStep === 'provider_select' && (
          <div className="space-y-4">
            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block text-center">To'lov provayderini tanlang</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'click', name: 'CLICK', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', logo: '🔵' },
                { id: 'payme', name: 'Payme', color: 'bg-teal-50 border-teal-200 text-teal-700', logo: '🟢' },
                { id: 'uzum', name: 'Uzum', color: 'bg-purple-50 border-purple-200 text-purple-700', logo: '🟣' }
              ].map(prov => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => handleProviderSelect(prov.id as any)}
                  className={`border-2 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${prov.color}`}
                >
                  <span className="text-xl">{prov.logo}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{prov.name}</span>
                </button>
              ))}
            </div>
            <p className="text-[8.5px] text-slate-400 font-bold leading-normal text-center">
              Tranzaksiyalar 100% xavfsiz va shifrlangan. To'lovingiz tasdiqlangach tarif avtomatik ravishda faollashadi.
            </p>
          </div>
        )}

        {/* Step 2: Card Credentials Input */}
        {buyPaymentStep === 'card_input' && (
          <form onSubmit={handleBuyCardSubmit} className="space-y-4 text-left">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
              <span className="text-xs">💳</span>
              <span className="text-[10px] font-black uppercase text-[#0082D5] tracking-wider">Uzcard / Humo ma'lumotlari</span>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Karta raqami (16 xonali)</label>
              <input 
                type="text" 
                placeholder="8600 0000 0000 0000"
                value={buyCardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                  const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                  setBuyCardNumber(formatted);
                }}
                className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Amal qilish muddati</label>
              <input 
                type="text" 
                placeholder="MM/YY"
                value={buyCardExpiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (val.length > 2) {
                    val = val.slice(0, 2) + '/' + val.slice(2);
                  }
                  setBuyCardExpiry(val);
                }}
                className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-xs font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0082D5] hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md shadow-blue-500/10"
            >
              SMS KODNI OLISH ➔
            </button>
          </form>
        )}

        {/* Step 3: SMS Code Input */}
        {buyPaymentStep === 'sms_input' && (
          <form onSubmit={handleBuySmsSubmit} className="space-y-4 text-center">
            <h4 className="text-xs font-black uppercase text-slate-800">SMS Kodni Tasdiqlash</h4>
            <p className="text-[9px] text-slate-500 leading-relaxed max-w-xs font-semibold mx-auto">
              Sizning telefon raqamingizga 5 xonali tasdiqlash kodi yuborildi. Iltimos kodni kiriting.
            </p>

            <input 
              type="text" 
              placeholder="•••••"
              value={buySmsCode}
              onChange={(e) => setBuySmsCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-1/2 bg-slate-50 border border-[#E2EAF8] rounded-xl py-2.5 text-center text-sm font-black text-slate-800 tracking-widest focus:outline-none focus:border-blue-500 font-mono"
              required
            />

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow"
            >
              KODNI TASDIQLASH ➔
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {buyPaymentStep === 'success' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 text-lg mx-auto animate-bounce">
              ✓
            </div>
            <h4 className="text-xs font-black text-slate-900 uppercase">To'lov Muvaffaqiyatli Yuborildi!</h4>
            <p className="text-[9px] text-slate-500 font-bold leading-normal max-w-xs mx-auto">
              To'lovingiz moderatsiyaga yuborildi. Administrator tomonidan tasdiqlanishi bilan sizga faol paket beriladi!
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
