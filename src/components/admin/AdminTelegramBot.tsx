import React, { useState } from 'react';
import { RefreshCw, Copy } from 'lucide-react';

interface AdminTelegramBotProps {
  botStatus: 'loading' | 'connected' | 'disconnected';
  botInfo: any;
  botError: string | null;
  botAppUrl: string;
  fetchBotInfo: () => void;
}

export default function AdminTelegramBot({
  botStatus,
  botInfo,
  botError,
  botAppUrl,
  fetchBotInfo
}: AdminTelegramBotProps) {
  const [copiedText, setCopiedText] = useState<'shared' | 'setup' | null>(null);

  const handleCopy = (text: string, type: 'shared' | 'setup') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-white/10 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">🤖 Telegram Bot Integratsiyasi</h3>
          <p className="text-[10px] text-white/50">Tizimni Telegram bot va Mini App bilan bog'lash sozlamalari</p>
        </div>
        <button 
          onClick={fetchBotInfo}
          disabled={botStatus === 'loading'}
          className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 text-blue-300 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${botStatus === 'loading' ? 'animate-spin' : ''}`} />
          Ulanishni tekshirish
        </button>
      </div>

      {/* STATUS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Ulanish holati</h4>
            
            {botStatus === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs text-white/60">Bot ma'lumotlari tekshirilmoqda...</p>
              </div>
            ) : botStatus === 'connected' && botInfo ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-black text-sm">✓</div>
                  <div>
                    <p className="text-xs font-black text-emerald-400 uppercase">BOT ULANGAN</p>
                    <p className="text-[10px] text-white/50">Tizim muvaffaqiyatli ishlamoqda</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">Bot nomi:</span>
                    <span className="font-bold text-white">{botInfo.firstName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">Username:</span>
                    <span className="font-mono text-blue-400 font-bold font-semibold">@{botInfo.username}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">Bot ID:</span>
                    <span className="font-mono text-white/60">{botInfo.id}</span>
                  </div>
                </div>
                <a 
                  href={`https://t.me/${botInfo.username}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-center rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  ✈️ Botni ochish
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 font-black text-sm">!</div>
                  <div>
                    <p className="text-xs font-black text-amber-400 uppercase">BOT ULANMAGAN</p>
                    <p className="text-[10px] text-white/50">Kalit o'rnatilmagan yoki xato</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Telegram orqali yangi e'lonlar haqida ogohlantirishlar olish, ommaviy xabarlar jo'natish va Mini Ilovani ochish uchun bot tokenini sozlang.
                </p>
                {botError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-300 font-medium">
                    ⚠️ {botError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* APP LINKS */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-black block">Web App Linklari</h4>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-white/50 block">Shared Web App Link:</span>
                <div className="flex gap-1.5 bg-slate-950 border border-white/5 p-2 rounded-xl items-center">
                  <span className="font-mono text-[10px] text-white/70 truncate flex-1">
                    {botAppUrl || window.location.origin}
                  </span>
                  <button 
                    onClick={() => handleCopy(botAppUrl || window.location.origin, 'shared')}
                    className="p-1.5 hover:bg-white/10 rounded text-blue-400 cursor-pointer"
                  >
                    {copiedText === 'shared' ? '✓' : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-300 leading-normal font-medium">
                💡 <b>Eslatma:</b> Telegram `@BotFather` da WebApp yoki Menu Button yaratganda aynan shu yuqoridagi havolani kiriting!
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRATION GUIDE */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-black uppercase text-blue-400 flex items-center gap-2">
            🛠️ Telegram Botni 5 daqiqada Ulash Qo'llanmasi
          </h4>
          
          <div className="space-y-4 text-xs text-white/80 leading-relaxed">
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 text-blue-300">1</div>
              <div className="space-y-1">
                <p className="font-bold text-white">Bot Father orqali bot oching</p>
                <p className="text-white/60">
                  Telegram qidiruvidan <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 font-bold underline">@BotFather</a> ni toping va unga <code>/newbot</code> buyrug'ini yuboring.
                  Botingizga istalgan sarlavha (masalan: <i>Sara Uylar Test</i>) va unga <b>username</b> (masalan: <code>sarauylar_bot</code>) bering.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 text-blue-300">2</div>
              <div className="space-y-1">
                <p className="font-bold text-white">Bot Tokenini (Secrets) platformaga o'rnating</p>
                <p className="text-white/60">
                  BotTokenini platformaning <b>Settings / Secrets</b> bo'limida <code>TELEGRAM_BOT_TOKEN</code> nomi ostida saqlang.
                </p>
                <p className="text-[10px] text-amber-400 font-semibold mt-1">
                  ⚠️ O'zgartirib saqlagandan so'ng tepadagi "Ulanishni tekshirish" tugmasini bosing!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 text-blue-300">3</div>
              <div className="space-y-1">
                <p className="font-bold text-white">Bot uchun Web App yarating (Yoki Menu tugmasini sozlang)</p>
                <p className="text-white/60">
                  BotFather'ga <code>/newapp</code> buyrug'ini bering, botingizni tanlang. Sarlavha va rasm yuklab bo'lgach, <b>Web App URL</b> so'raganda quyidagi havolani kiriting:
                </p>
                <div className="my-2 flex gap-1.5 max-w-md bg-slate-950 p-2 border border-white/5 rounded-xl items-center">
                  <span className="font-mono text-[10px] text-blue-400 truncate flex-1">
                    {botAppUrl || window.location.origin}
                  </span>
                  <button 
                    onClick={() => handleCopy(botAppUrl || window.location.origin, 'setup')}
                    className="p-1 text-[9px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded px-2 cursor-pointer"
                  >
                    {copiedText === 'setup' ? 'Nusxalandi!' : 'Nusxalash'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 text-blue-300">4</div>
              <div className="space-y-1">
                <p className="font-bold text-white">"Menu Button" (Pastki asosiy tugma) ni sozlash</p>
                <p className="text-white/60">
                  BotFather'da <code>/setmenubutton</code> buyrug'ini bering, botingizni tanlang. So'ng tepadagi nusxalangan havolani kiriting va tugma nomiga <b>"🏠 Ilovani Ochish"</b> yoki <b>"📱 Sara Uylar"</b> deb yozing.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 text-blue-300">5</div>
              <div className="space-y-1">
                <p className="font-bold text-white">Botni ishga tushiring! 🎉</p>
                <p className="text-white/60">
                  O'zingiz yaratgan botga kirib <code>/start</code> bosing. U erda sizga xush kelibsiz xabari, qidiruv imkoniyatlari va mini-ilovangizga o'tish tugmasi taqdim etiladi!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
