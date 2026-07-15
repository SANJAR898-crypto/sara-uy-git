import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';

interface ToastProps {
  message: string;
  title?: string;
  onClose: () => void;
  isOpen: boolean;
}

export default function Toast({ message, title = "Sara Uylar", onClose, isOpen }: ToastProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className="fixed top-4 inset-x-4 mx-auto max-w-sm bg-white border border-[#E2EAF8] rounded-2xl p-4 shadow-xl z-50 flex gap-3 items-start"
        >
          <div className="w-8 h-8 rounded-full bg-[#0082D5]/10 flex items-center justify-center shrink-0 text-[#0082D5]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs text-slate-900 tracking-tight">{title}</h4>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">{message}</p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[8px] text-[#0082D5] font-extrabold uppercase tracking-widest">SARA SYSTEM</span>
              <button
                onClick={onClose}
                className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
              >
                Yopish
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
