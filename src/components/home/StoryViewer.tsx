import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StorySlide {
  id: string;
  title: string;
  price?: string;
  imageUrl: string;
  desc?: string;
  listingId?: string;
  ownerPhone?: string;
}

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'villas' | 'apartments' | 'cheap' | 'tips' | null;
  onCategoryChange: (category: 'villas' | 'apartments' | 'cheap' | 'tips' | null) => void;
  customStories?: Record<string, StorySlide[]>;
  defaultStories: Record<string, StorySlide[]>;
}

export default function StoryViewer({
  isOpen,
  onClose,
  category,
  onCategoryChange,
  customStories = {},
  defaultStories
}: StoryViewerProps) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const longPressTimerRef = useRef<any>(null);

  const getCombinedSlides = (cat: 'villas' | 'apartments' | 'cheap' | 'tips' | null): StorySlide[] => {
    if (!cat) return [];
    const defaults = defaultStories[cat] || [];
    const customs = customStories[cat] || [];
    return [...defaults, ...customs];
  };

  const currentSlides = getCombinedSlides(category);

  // Reset slide index on category change
  useEffect(() => {
    setActiveSlideIdx(0);
    setStoryProgress(0);
  }, [category]);

  const handleNextSlide = () => {
    if (!category) return;
    const slides = getCombinedSlides(category);
    if (activeSlideIdx < slides.length - 1) {
      setActiveSlideIdx(prev => prev + 1);
      setStoryProgress(0);
    } else {
      // Auto-advance to the next category
      const categories: ('villas' | 'apartments' | 'cheap' | 'tips')[] = ['villas', 'apartments', 'cheap', 'tips'];
      const currentCatIdx = categories.indexOf(category);
      let nextCatIdx = currentCatIdx + 1;
      
      while (nextCatIdx < categories.length) {
        const nextCat = categories[nextCatIdx];
        if (getCombinedSlides(nextCat).length > 0) {
          onCategoryChange(nextCat);
          setActiveSlideIdx(0);
          setStoryProgress(0);
          return;
        }
        nextCatIdx++;
      }
      
      onClose();
    }
  };

  const handlePrevSlide = () => {
    if (!category) return;
    if (activeSlideIdx > 0) {
      setActiveSlideIdx(prev => prev - 1);
      setStoryProgress(0);
    } else {
      // Go back to previous category's last slide
      const categories: ('villas' | 'apartments' | 'cheap' | 'tips')[] = ['villas', 'apartments', 'cheap', 'tips'];
      const currentCatIdx = categories.indexOf(category);
      let prevCatIdx = currentCatIdx - 1;
      
      while (prevCatIdx >= 0) {
        const prevCat = categories[prevCatIdx];
        const prevSlides = getCombinedSlides(prevCat);
        if (prevSlides.length > 0) {
          onCategoryChange(prevCat);
          setActiveSlideIdx(prevSlides.length - 1);
          setStoryProgress(0);
          return;
        }
        prevCatIdx--;
      }
      
      onClose();
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (diffY < -60 && Math.abs(diffY) > Math.abs(diffX)) {
      onClose();
    } else if (Math.abs(diffX) > 60) {
      if (diffX > 60) {
        handleNextSlide();
      } else if (diffX < -60) {
        handlePrevSlide();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleZonePointerDown = () => {
    setIsPaused(true);
    setIsLongPress(false);
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPress(true);
    }, 200);
  };

  const handleZonePointerUp = (isRight: boolean) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    setIsPaused(false);
    if (!isLongPress) {
      if (isRight) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
  };

  // Preloading
  useEffect(() => {
    if (isOpen && category) {
      const slides = getCombinedSlides(category);
      const nextIdx = activeSlideIdx + 1;
      if (nextIdx < slides.length) {
        const nextSlide = slides[nextIdx];
        if (nextSlide?.imageUrl) {
          const img = new Image();
          img.src = nextSlide.imageUrl;
        }
      }
    }
  }, [isOpen, category, activeSlideIdx]);

  // Timer effect
  useEffect(() => {
    if (!isOpen || !category || currentSlides.length === 0) {
      setStoryProgress(0);
      return;
    }

    if (isPaused) return;

    const intervalTime = 50;
    const slideDuration = 5000;
    const increment = (intervalTime / slideDuration) * 100;

    const timer = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          setTimeout(() => handleNextSlide(), 0);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, category, activeSlideIdx, isPaused]);

  return (
    <AnimatePresence>
      {isOpen && category && currentSlides.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between font-sans text-white select-none overflow-hidden touch-none"
        >
          {/* Top Bar Progress */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 space-y-3.5 pointer-events-none">
            <div className="flex gap-1.5 px-0.5">
              {currentSlides.map((_, idx) => {
                let fillWidth = "0%";
                if (idx < activeSlideIdx) fillWidth = "100%";
                else if (idx === activeSlideIdx) fillWidth = `${storyProgress}%`;
                
                return (
                  <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
                    <div 
                      className="h-full bg-white transition-all duration-75 rounded-full shadow-xs"
                      style={{ width: fillWidth }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Logo / Header */}
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
              onPointerUp={() => handleZonePointerUp(false)}
              onPointerLeave={() => setIsPaused(false)}
              className="w-1/4 h-full cursor-pointer" 
            />
            <div 
              onPointerDown={handleZonePointerDown}
              onPointerUp={() => handleZonePointerUp(true)}
              onPointerLeave={() => setIsPaused(false)}
              className="w-3/4 h-full cursor-pointer" 
            />
          </div>

          {/* Image slide */}
          <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
            <AnimatePresence mode="wait">
              {currentSlides[activeSlideIdx] && (
                <motion.img 
                  key={`${category}-${activeSlideIdx}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  src={currentSlides[activeSlideIdx].imageUrl} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />
          </div>

          {/* Bottom sheet */}
          {currentSlides[activeSlideIdx] && (
            <div className="absolute bottom-0 inset-x-0 p-5 pb-9 space-y-4.5 z-30 text-left bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
              <div className="space-y-2">
                {currentSlides[activeSlideIdx].price && (
                  <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full shadow-lg tracking-wide uppercase font-mono">
                    {currentSlides[activeSlideIdx].price}
                  </span>
                )}
                <h3 className="text-base font-black text-white leading-snug tracking-tight drop-shadow-md">
                  {currentSlides[activeSlideIdx].title}
                </h3>
                <p className="text-[11px] text-slate-200/90 leading-relaxed font-medium drop-shadow-sm">
                  {currentSlides[activeSlideIdx].desc}
                </p>
              </div>

              {currentSlides[activeSlideIdx].ownerPhone && (
                <div className="pt-1.5 pointer-events-auto">
                  <a
                    href={`tel:${currentSlides[activeSlideIdx].ownerPhone}`}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0082D5] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-98"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    Bog'lanish: {currentSlides[activeSlideIdx].ownerPhone}
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
