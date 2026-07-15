import React, { useState } from 'react';
import { Search, Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing, District, Region } from '../../types';
import { getRegionName, getDistrictName } from '../../utils/helpers';
import EmptyState from '../common/EmptyState';

interface SearchResultsProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  districts: District[];
  regions: Region[];
}

// Inner Result Card to manage its own swipe state cleanly
function ResultCard({
  listing,
  favorites,
  onToggleFavorite,
  onSelectListing,
  districts,
  regions
}: {
  key?: string | number;
  listing: Listing;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  districts: District[];
  regions: Region[];
}) {
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
      className="bg-white border border-[#E2EAF8] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer relative group flex flex-col sm:flex-row gap-3 p-3 font-sans"
    >
      {/* Left/Top Column: Image box with gallery dots */}
      <div className="w-full sm:w-[130px] h-[100px] rounded-xl overflow-hidden shrink-0 relative bg-slate-100 shadow-2xs">
        <img 
          src={listing.imageUrls[currentImgIdx] || listing.imageUrls[0]} 
          alt="Property visual" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Swipe dots indicators */}
        {listing.imageUrls.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {listing.imageUrls.map((_, i) => (
              <div 
                key={i}
                className={`w-1 h-1 rounded-full transition-all ${
                  currentImgIdx === i ? 'bg-[#0082D5] w-2' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Swipe arrow controls for desktop/mouse */}
        {listing.imageUrls.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition cursor-pointer z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-2.5 h-2.5" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition cursor-pointer z-10 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </>
        )}

        {/* Floating priority badges */}
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ${
            listing.dealType === 'sale' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {listing.dealType === 'sale' ? 'Sale' : 'Rent'}
          </span>
          
          {listing.plan === 'vip' ? (
            <span className="text-[7px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-xs">
              🥇 VIP
            </span>
          ) : listing.plan === 'premium' ? (
            <span className="text-[7px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded shadow-xs">
              🥈 Premium
            </span>
          ) : (
            <span className="text-[7px] bg-slate-400 text-white font-black px-1.5 py-0.5 rounded shadow-xs">
              🥉 Standard
            </span>
          )}
        </div>

        {/* Favorite heart on card image */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
          className="absolute right-1.5 top-1.5 z-10 p-1.5 rounded-full bg-white/85 hover:bg-white text-slate-800 transition shadow-md active:scale-90 cursor-pointer"
        >
          <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Right Column: Listing info */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-1">
          <h4 className="font-bold text-xs text-slate-950 line-clamp-2 leading-tight group-hover:text-[#0082D5] transition duration-300">
            {listing.title}
          </h4>
          <p className="text-[9px] text-slate-400 flex items-center gap-0.5 font-medium">
            <MapPin className="w-3 h-3 text-[#0082D5]" />
            {getRegionName(listing.regionId, regions)}, {getDistrictName(listing.districtId, districts)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-bold border-t border-slate-50 pt-2 mt-2 gap-2">
          <div className="flex gap-2">
            <span>📐 {listing.area} m²</span>
            <span>🏢 {listing.rooms} xona</span>
            <span>👁 {listing.viewsCount} views</span>
          </div>
          <span className="text-[#0082D5] font-black text-xs font-mono ml-auto">
            ${listing.price.toLocaleString()}
            {listing.dealType === 'rent' && <span className="text-[8px] text-slate-400 font-normal">/oy</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SearchResults({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  districts,
  regions
}: SearchResultsProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="Hech qanday mulk topilmadi"
        description="Boshqa qidiruv mezonlarini sinab ko'ring yoki boshqa hududlarni tanlang."
        icon={<Search className="w-8 h-8 text-[#0082D5]" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {listings.map(listing => (
        <ResultCard
          key={listing.id}
          listing={listing}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onSelectListing={onSelectListing}
          districts={districts}
          regions={regions}
        />
      ))}
    </div>
  );
}
