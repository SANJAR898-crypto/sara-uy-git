import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone } from 'lucide-react';
import { DEFAULT_STORIES, StorySlide } from '../../data/stories';

interface StoriesPlayerProps {
  isOpen: boolean;
  category: string | null;
  onClose: () => void;
}

export default function StoriesPlayer({
  isOpen,
  category,
  onClose
}: StoriesPlayerProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = category ? DEFAULT_STORIES[category] || [] : [];

  // Reset slide index and progress when a new category is opened
  useEffect(() => {
    if (isOpen) {
      setActiveSlideIdx(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, category]);

  // Handle Stories progress bar ticking
  useEffect(() => {
    if (!isOpen || slides.length === 0) return;

    const interval = setInterval(() => {
      if (isPaused) return;
      setProgress(prev => {
        if (prev >= 100) {
          if (activeSlideIdx >= slides.length - 1) {
            onClose();
            return 0;
          } else {
            setActiveSlideIdx(idx => idx + 1);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, activeSlideIdx, isPaused, slides.length, onClose]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[activeSlideIdx];

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const handleZonePointerDown = () => setIsPaused(true);
  const handleZonePointerUp = (e: React.PointerEvent, isNext: boolean) => {
    setIsPaused(false);
    if (isNext) {
      if (activeSlideIdx >= slides.length - 1) {
        onClose();
      } else {
        setActiveSlideIdx(prev => prev + 1);
        setProgress(0);
      }
    } else {
      if (activeSlideIdx > 0) {
        setActiveSlideIdx(prev => prev - 1);
        setProgress(0);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between font-sans text-white select-none overflow-hidden touch-none"
      >
        {/* Top Progress indicators + Header info */}
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 space-y-3.5 pointer-events-none">
          <div className="flex gap-1.5 px-0.5">
            {slides.map((slide, idx) => {
              let fillWidth = "0%";
              if (idx < activeSlideIdx) fillWidth = "100%";
              else if (idx === activeSlideIdx) fillWidth = `${progress}%`;
              
              return (
                <div key={slide.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
                  <div 
                    className="h-full bg-white transition-all duration-75 rounded-full shadow-xs"
                    style={{ width: fillWidth }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-amber-400 text-lg border border-white/20 backdrop-blur-md shadow-inner">
                {category === 'villas' ? '🏡' : category === 'apartments' ? '🏢' : category === 'cheap' ? '💰' : '💡'}
              </div>
              <div>
                <h4 className="text-[11px] font-black tracking-wider uppercase text-white drop-shadow-xs">
                  {category === 'villas' ? 'Dabdabali Villalar' : category === 'apartments' ? 'Shinam Kvartiralar' : category === 'cheap' ? 'Hamyonbop uylar' : 'Foydali Maslahatlar'}
                </h4>
                <span className="text-[7.5px] text-white/70 font-bold uppercase tracking-widest block mt-0.5">SARA UYLAR STORIES</span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/10 cursor-pointer backdrop-blur-md transition-all active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tap Zones */}
        <div className="absolute inset-0 flex z-20">
          <div 
            onPointerDown={handleZonePointerDown}
            onPointerUp={(e) => handleZonePointerUp(e, false)}
            onPointerLeave={() => setIsPaused(false)}
            className="w-1/4 h-full cursor-pointer" 
          />
          <div 
            onPointerDown={handleZonePointerDown}
            onPointerUp={(e) => handleZonePointerUp(e, true)}
            onPointerLeave={() => setIsPaused(false)}
            className="w-3/4 h-full cursor-pointer" 
          />
        </div>

        {/* Slide Image */}
        <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
          <AnimatePresence mode="wait">
            {currentSlide && (
              <motion.img 
                key={`${category}-${activeSlideIdx}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                src={currentSlide.imageUrl} 
                alt="" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />
        </div>

        {/* Bottom Sheet description */}
        {currentSlide && (
          <div className="absolute bottom-0 inset-x-0 p-5 pb-9 space-y-4.5 z-30 text-left bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
            <div className="space-y-2">
              {currentSlide.price && (
                <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full shadow-lg tracking-wide uppercase font-mono">
                  {currentSlide.price}
                </span>
              )}
              <h3 className="text-base font-black text-white leading-snug tracking-tight drop-shadow-md">
                {currentSlide.title}
              </h3>
              <p className="text-[11px] text-slate-200/90 leading-relaxed font-medium drop-shadow-sm">
                {currentSlide.desc}
              </p>
            </div>

            {currentSlide.ownerPhone && (
              <div className="pt-1.5 pointer-events-auto">
                <a
                  href={`tel:${currentSlide.ownerPhone}`}
                  className="w-full py-3.5 bg-gradient-to-r from-[#0082D5] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-98"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  Bog'lanish: {currentSlide.ownerPhone}
                </a>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
