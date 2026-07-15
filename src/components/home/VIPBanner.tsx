import React, { useState, useEffect } from 'react';
import { Award, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, District } from '../../types';
import { getDistrictName } from '../../utils/helpers';

interface VIPBannerProps {
  vipListings: Listing[];
  districts: District[];
  onSelectListing: (listing: Listing) => void;
}

export default function VIPBanner({
  vipListings,
  districts,
  onSelectListing
}: VIPBannerProps) {
  const [activeVipIdx, setActiveVipIdx] = useState(0);

  // Auto-advance VIP Carousel every 6 seconds
  useEffect(() => {
    if (vipListings.length <= 1) return;
    const interval = setInterval(() => {
      setActiveVipIdx(prev => (prev + 1) % vipListings.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [vipListings.length]);

  if (vipListings.length === 0) return null;

  const currentListing = vipListings[activeVipIdx];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVipIdx(prev => (prev - 1 + vipListings.length) % vipListings.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVipIdx(prev => (prev + 1) % vipListings.length);
  };

  return (
    <div className="relative rounded-[28px] overflow-hidden border border-slate-100 shadow-premium-lg h-[190px] bg-slate-950 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeVipIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onSelectListing(currentListing)}
          className="absolute inset-0 w-full h-full cursor-pointer group tap-feedback"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent z-10"></div>
          <img 
            src={currentListing.imageUrls[0]} 
            alt="VIP Offer"
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          {/* VIP badge */}
          <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[8.5px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg border border-amber-300/30">
            <Award className="w-3.5 h-3.5 fill-slate-950" /> VIP TAKLIF
          </div>
          
          <div className="absolute top-3.5 right-3.5 z-20 bg-white/10 backdrop-blur-md text-white text-[8.5px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-1">
            <span className="text-amber-400 text-xs">★</span> {currentListing.rating} RATING
          </div>

          <div className="absolute bottom-4 left-5 right-5 z-20 space-y-1">
            <span className="text-[9px] font-black tracking-widest text-sky-400 uppercase">
              {currentListing.dealType === 'sale' ? 'SOTISH' : 'IJARA'} • {currentListing.propertyType.toUpperCase()}
            </span>
            <h3 className="text-sm font-black text-white line-clamp-1 leading-snug drop-shadow-md tracking-tight">{currentListing.title}</h3>
            <div className="flex justify-between items-center pt-0.5">
              <p className="text-[10px] text-white/80 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                {getDistrictName(currentListing.districtId, districts)}
              </p>
              <span className="text-sm font-black text-amber-300 drop-shadow-sm">
                ${currentListing.price.toLocaleString()}
                {currentListing.dealType === 'rent' && <span className="text-[9px] text-white/60 font-medium">/oy</span>}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left/Right Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition active:scale-90 cursor-pointer"
      >
        <ChevronLeft className="w-4.5 h-4.5" />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/20 hover:bg-black/40 border border-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md transition active:scale-90 cursor-pointer"
      >
        <ChevronRight className="w-4.5 h-4.5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {vipListings.map((_, idx) => (
          <button 
            key={idx}
            onClick={(e) => { e.stopPropagation(); setActiveVipIdx(idx); }}
            className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${activeVipIdx === idx ? 'bg-amber-400 w-4' : 'bg-white/45 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  );
}
