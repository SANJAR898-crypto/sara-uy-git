import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, Trash2, CheckCircle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  service: string;
  message: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const initialLogTemplates = [
    { level: 'info', service: 'AUTH', message: 'Telegram Mini App signature verification initialized' },
    { level: 'success', service: 'AUTH', message: 'Verified secure signature for user ID: 8638170982 (Administrator)' },
    { level: 'info', service: 'DATABASE', message: 'SQLite/Cloud SQL Connection established successfully' },
    { level: 'success', service: 'SYNC', message: 'Synchronized 18 real estate listings with primary repository' },
    { level: 'info', service: 'WEBHOOK', message: 'Listening on Telegram Bot webhook port: 3000' },
    { level: 'success', service: 'CRON', message: 'Subscription expiry check completed. 0 expired listings.' },
    { level: 'info', service: 'PAYMENT', message: 'Awaiting webhook response from Click Merchant API' },
    { level: 'info', service: 'TELEGRAM', message: 'Polled bot info: @SARAUYLAR1_BOT, status: ACTIVE' },
    { level: 'warn', service: 'SECURITY', message: 'Rate limit threshold reached for endpoint /api/reviews [IP: 84.54.120.9]' },
    { level: 'success', service: 'BROADCAST', message: 'Broadcasted message via @SARAUYLAR1_BOT to 1,240 subscribers' },
  ];

  useEffect(() => {
    // Generate initial set of logs
    const initialLogs: LogEntry[] = [];
    const now = new Date();
    for (let i = 0; i < 20; i++) {
      const template = initialLogTemplates[Math.floor(Math.random() * initialLogTemplates.length)];
      const logTime = new Date(now.getTime() - (20 - i) * 60000);
      initialLogs.push({
        timestamp: logTime.toLocaleTimeString(),
        level: template.level as any,
        service: template.service,
        message: template.message
      });
    }
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    // Add a new log entry every few seconds to simulate a live terminal
    const interval = setInterval(() => {
      const services = ['API', 'TELEGRAM', 'PAYMENT', 'SYNC', 'AUTH', 'CRON', 'DATABASE'];
      const levels: LogEntry['level'][] = ['info', 'success', 'warn'];
      
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      
      let randomMessage = 'Triggered internal state sync event';
      if (randomService === 'API') {
        randomMessage = `GET /api/listings - 200 OK - processed in ${Math.floor(Math.random() * 50) + 10}ms`;
      } else if (randomService === 'TELEGRAM') {
        randomMessage = `Received update ID ${Math.floor(Math.random() * 100000) + 500000} from user @sara_broker`;
      } else if (randomService === 'PAYMENT') {
        randomMessage = `Inbound Payme billing invoice status set to SUCCESS (Invoice #${Math.floor(Math.random() * 5000) + 1000})`;
      } else if (randomService === 'AUTH') {
        randomMessage = `Authenticated secure session token x-telegram-init-data`;
      } else if (randomService === 'CRON') {
        randomMessage = 'Pruned expired VIP slider banners, recalculated rotation index';
      } else if (randomService === 'DATABASE') {
        randomMessage = `Committed transaction to regional node`;
      }

      const newLog: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        level: randomLevel,
        service: randomService,
        message: randomMessage
      };

      setLogs(prev => {
        const next = [...prev, newLog];
        return next.slice(-100); // Keep last 100 logs
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  return (
    <div className="space-y-6 text-white font-sans">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase text-blue-400 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" /> Tizim Jurnallari (System Logs)
          </h3>
          <p className="text-[10px] text-white/50">Real vaqtda platforma faolligi va Telegram Bot hodisalarini kuzatish</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Tozalash
          </button>
          
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              autoScroll 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            Avto-scrolling: {autoScroll ? 'Yoqiq' : 'Ochig'}'
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 font-mono text-[11px] leading-relaxed relative shadow-inner shadow-black overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-white/40 text-[9px] uppercase tracking-widest font-black">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="ml-2">sarauylar-node-vm-01</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" /> LIVE STREAMING
          </div>
        </div>

        {/* Scrollable logs area */}
        <div className="h-[400px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 pr-2">
          {logs.map((log, index) => {
            const levelColors = {
              info: 'text-blue-400',
              warn: 'text-amber-400 font-bold',
              error: 'text-red-400 font-bold bg-red-500/10 px-1 rounded',
              success: 'text-emerald-400'
            };

            const levelLabel = log.level.toUpperCase();

            return (
              <div key={index} className="flex items-start gap-2.5 hover:bg-white/2 rounded py-0.5 px-1 transition-colors">
                <span className="text-white/30 shrink-0 select-none font-semibold">[{log.timestamp}]</span>
                <span className={`shrink-0 select-none font-black text-[9px] tracking-wider uppercase ${levelColors[log.level]}`}>
                  [{levelLabel}]
                </span>
                <span className="text-white/40 shrink-0 font-bold uppercase tracking-wider text-[10px]">
                  {log.service}:
                </span>
                <span className="text-white/80 break-all">{log.message}</span>
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
