import React from 'react';
import { Heart } from 'lucide-react';
import { Listing, District } from '../../types';
import { getDistrictName } from '../../utils/helpers';
import EmptyState from '../common/EmptyState';

interface FavoritesProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  districts: District[];
}

export default function Favorites({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  districts
}: FavoritesProps) {
  const favoriteListings = listings.filter(l => favorites.includes(l.id));

  if (favoriteListings.length === 0) {
    return (
      <div className="space-y-4 font-sans">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0082D5] border-b border-[#E2EAF8] pb-2">Sevimlilar ro'yxati</h3>
        <EmptyState
          title="Saqlangan uylar yo'q"
          description="Uylardagi yurakcha belgisini bosish orqali sevimlilarga qo'shing."
          icon={<Heart className="w-8 h-8 text-[#0082D5]" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#0082D5] border-b border-[#E2EAF8] pb-2">Sevimlilar ro'yxati</h3>
      
      <div className="space-y-2">
        {favoriteListings.map(listing => (
          <div 
            key={listing.id}
            onClick={() => onSelectListing(listing)}
            className="bg-white hover:bg-slate-50 border border-[#E2EAF8] rounded-2xl p-2.5 flex gap-3 cursor-pointer transition relative group shadow-2xs"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
              <img 
                src={listing.imageUrls[0]} 
                alt="Thumbnail" 
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[11px] text-slate-900 line-clamp-1 pr-2">{listing.title}</h4>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
                  className="text-red-500 cursor-pointer"
                >
                  <Heart className="w-3 h-3 fill-red-500" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                <span>{getDistrictName(listing.districtId, districts)}</span>
                <span className="text-emerald-600 font-extrabold">${listing.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
