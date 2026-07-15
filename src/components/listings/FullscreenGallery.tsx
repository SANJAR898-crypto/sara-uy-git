import React from 'react';
import { X } from 'lucide-react';
import { Listing } from '../../types';

interface FullscreenGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  activeImageIdx: number;
  setActiveImageIdx: React.Dispatch<React.SetStateAction<number>>;
}

export default function FullscreenGallery({
  isOpen,
  onClose,
  listing,
  activeImageIdx,
  setActiveImageIdx
}: FullscreenGalleryProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col justify-between p-4 font-sans">
      <button 
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center self-end cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="flex-1 flex items-center justify-center">
        <img 
          src={listing.imageUrls[activeImageIdx]} 
          alt="Fullscreen Property" 
          className="max-w-full max-h-[80vh] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      {listing.imageUrls.length > 1 && (
        <div className="flex justify-between text-white text-[10px] font-bold p-2">
          <button 
            onClick={() => setActiveImageIdx(prev => (prev - 1 + listing.imageUrls.length) % listing.imageUrls.length)}
            className="px-4 py-2 bg-white/10 rounded cursor-pointer"
          >
            ◀ Oldingi
          </button>
          <span className="self-center font-mono">
            {activeImageIdx + 1} / {listing.imageUrls.length}
          </span>
          <button 
            onClick={() => setActiveImageIdx(prev => (prev + 1) % listing.imageUrls.length)}
            className="px-4 py-2 bg-white/10 rounded cursor-pointer"
          >
            Keyingi ▶
          </button>
        </div>
      )}
    </div>
  );
}
