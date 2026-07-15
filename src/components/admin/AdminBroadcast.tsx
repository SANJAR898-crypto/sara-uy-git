import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface AdminBroadcastProps {
  onBroadcastMessage: (title: string, message: string) => void;
}

export default function AdminBroadcast({ onBroadcastMessage }: AdminBroadcastProps) {
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcStatus, setBcStatus] = useState(false);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;

    onBroadcastMessage(bcTitle.trim(), bcMessage.trim());
    setBcStatus(true);
    setBcTitle('');
    setBcMessage('');

    setTimeout(() => {
      setBcStatus(false);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Telegram Bot Ommaviy Reklama Jo'natish</h3>
        <span className="text-[10px] text-white/50">Push-Broadcast API</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Broadcast input panel */}
        <div className="md:col-span-7 bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-white/60 leading-relaxed">
            Ushbu modul orqali barcha faol Telegram bot foydalanuvchilarining bot chatiga push xabarnoma hamda yangi uylar bo'yicha reklama sarlavhalarini jo'nata olasiz.
          </p>

          {bcStatus && (
            <div className="p-3 bg-emerald-600/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
              ✓ Reklama push-xabar barcha bot a'zolariga muvaffaqiyatli jo'natildi!
            </div>
          )}

          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Xabar sarlavhasi (Title)</label>
              <input 
                type="text" 
                required
                placeholder="Masalan: Toshkent markazida yangi hashamatli kvartiralar!"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-widest block mb-1">Xabar matni (Message body)</label>
              <textarea 
                required
                rows={5}
                placeholder="Chegirma shartlari, xonalar soni va bog'lanish havolalari..."
                value={bcMessage}
                onChange={(e) => setBcMessage(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1 cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5" /> Telegram orqali push jo'natish ➔
            </button>
          </form>
        </div>

        {/* Bot template preview mockup */}
        <div className="md:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest block mb-3">Push xabarnoma ko'rinishi (Telegram)</h4>
            <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[9px] text-white/40 pb-1 border-b border-white/5">
                <span>💬 SARA UYLAR BOT PUSH</span>
                <span>Hozir</span>
              </div>
              <div className="p-2 bg-[#182533] rounded-lg border border-white/5">
                <h5 className="font-extrabold text-[11px] text-white">{bcTitle || "Ommaviy xabar sarlavhasi"}</h5>
                <p className="text-[10px] text-white/70 leading-relaxed mt-1">{bcMessage || "Yuboriladigan reklama push xabar matni ko'rinishi..."}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-600/15 border border-blue-500/20 rounded-xl text-[10px] text-white/60">
            ⚡ <b>Maslahat:</b> Reklamalarga ko'proq foydali parametrlar va sotuvchi telefon raqamlarini aniq yozish orqali aloqa so'rovlarini 2 barobar ko'paytirish mumkin.
          </div>
        </div>
      </div>
    </div>
  );
}
