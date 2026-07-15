import React, { useState } from 'react';
import { Heart, MapPin, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Listing, District } from '../../types';
import { getDistrictName } from '../../utils/helpers';

interface ListingCardProps {
  key?: string | number;
  listing: Listing;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  districts: District[];
  isVip?: boolean;
  isPremium?: boolean;
}

export default function ListingCard({
  listing,
  favorites,
  onToggleFavorite,
  onSelectListing,
  districts,
  isVip = false,
  isPremium = false
}: ListingCardProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.imageUrls.length > 1) {
      setCurrentImgIdx(prev => (prev - 1 + listing.imageUrls.length) % listing.imageUrls.length);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.imageUrls.length > 1) {
      setCurrentImgIdx(prev => (prev + 1) % listing.imageUrls.length);
    }
  };

  const isFavorited = favorites.includes(listing.id);

  return (
    <div 
      onClick={() => onSelectListing(listing)}
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] group font-sans relative flex flex-col gap-3 pb-3.5 border-slate-100`}
    >
      {/* Image Container */}
      <div className="w-full aspect-[16/10] relative overflow-hidden bg-slate-50">
        <img 
          src={listing.imageUrls[currentImgIdx] || listing.imageUrls[0]} 
          alt={listing.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
        />
        
        {/* Navigation arrows (only visible on hover or if there are multiple images) */}
        {listing.imageUrls.length > 1 && (
          <div className="absolute inset-x-2.5 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handlePrevImage}
              className="w-7 h-7 bg-white/90 border border-slate-200/30 text-slate-800 rounded-full flex items-center justify-center hover:bg-white shadow-md cursor-pointer pointer-events-auto transition active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextImage}
              className="w-7 h-7 bg-white/90 border border-slate-200/30 text-slate-800 rounded-full flex items-center justify-center hover:bg-white shadow-md cursor-pointer pointer-events-auto transition active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Status indicator / Deal Type Badge */}
        <div className="absolute top-3.5 left-3.5 z-10 flex gap-1.5">
          <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded-md shadow-sm">
            {listing.dealType === 'sale' ? 'Sotiladi' : 'Ijara'}
          </span>
          {isVip && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-md shadow-sm">
              👑 VIP
            </span>
          )}
          {isPremium && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md shadow-sm">
              ⚡ Premium
            </span>
          )}
        </div>

        {/* Favorite Heart Trigger */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
          className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white border border-slate-200/30 flex items-center justify-center text-slate-600 transition shadow-md cursor-pointer z-10 active:scale-90"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>

        {/* Dot Pagination for images inside card */}
        {listing.imageUrls.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {listing.imageUrls.map((_, idx) => (
              <span 
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${currentImgIdx === idx ? 'bg-white w-3' : 'bg-white/50 w-1'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="px-3.5 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition duration-300 tracking-tight flex-1">
            {listing.title}
          </h4>
          <div className="flex items-center gap-0.5 text-xs font-semibold text-slate-700 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{listing.rating || '4.8'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {getDistrictName(listing.districtId, districts)}
        </p>

        <div className="text-xs text-slate-500 font-medium pt-0.5">
          📐 {listing.area} m² • 🏢 {listing.rooms} xona
        </div>

        <div className="pt-1.5 flex justify-between items-center border-t border-slate-100 mt-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Narxi</span>
          <span className="font-black text-sm tracking-tight text-slate-900">
            ${listing.price.toLocaleString()}
            {listing.dealType === 'rent' && <span className="text-[10px] text-slate-400 font-normal"> /oy</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
