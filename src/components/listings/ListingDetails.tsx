import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Heart, Share2, MapPin, Phone, Send, MessageCircle, X, CheckCircle, ExternalLink, Edit3, Archive, Trash2, Globe } from 'lucide-react';
import { Listing, District, Region, User as UserType, Inquiry } from '../../types';
import { getRegionName, getDistrictName } from '../../utils/helpers';
import FullscreenGallery from './FullscreenGallery';
import ContactModal from './ContactModal';

interface ListingDetailsProps {
  listing: Listing | null;
  onClose: () => void;
  favorites?: string[];
  onToggleFavorite: (id: string) => void;
  listings?: Listing[];
  currentUser: UserType & { phone?: string };
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  districts?: District[];
  regions?: Region[];
  onSelectListing?: (listing: Listing) => void;
  isFavorite?: boolean;
  isOpen?: boolean;
  onDeleteListing?: (id: string) => Promise<void>;
  onArchiveListing?: (id: string) => Promise<void>;
  onEditListing?: (listing: Listing) => void;
  onRequireProfileCompletion?: (actionName: string, onSuccess: () => void) => void;
}

export default function ListingDetails({
  listing,
  onClose,
  favorites = [],
  onToggleFavorite,
  listings = [],
  currentUser,
  onAddInquiry,
  districts = [],
  regions = [],
  onSelectListing,
  isFavorite,
  isOpen,
  onDeleteListing,
  onArchiveListing,
  onEditListing,
  onRequireProfileCompletion
}: ListingDetailsProps) {
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  
  const [contactType, setContactType] = useState<'call' | 'telegram' | 'whatsapp' | null>(null);
  const [contactMessage, setContactMessage] = useState("Assalomu alaykum, ushbu ko'chmas mulk e'loni bo'yicha batafsil ma'lumot bera olasizmi?");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const checkProfileAndSetContact = (type: 'call' | 'telegram' | 'whatsapp', msg: string) => {
    setContactType(type);
    setContactMessage(msg);
  };

  const handleSelectListing = onSelectListing || (() => {});
  const actualIsFavorite = isFavorite !== undefined ? isFavorite : (listing ? favorites.includes(listing.id) : false);

  if (!listing) return null;

  const userUname = (currentUser.username || '').toLowerCase().replace('@', '');
  const userPhone = (currentUser.phone || '').replace(/[^0-9]/g, '');
  const userTgId = (currentUser.telegramId || '').toString();

  const listingUname = (listing.ownerTelegram || '').toLowerCase().replace('@', '');
  const listingPhone = (listing.ownerPhone || '').replace(/[^0-9]/g, '');

  const isOwner = (userUname && listingUname === userUname) ||
                  (userPhone && listingPhone === userPhone) ||
                  (userTgId && listingUname === userTgId);

  const handleShare = () => {
    const text = `SARA UYLAR: ${listing.title}\nNarxi: $${listing.price.toLocaleString()}\nBatafsil: app.sarauylar.uz/listings/${listing.id}`;
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: text,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => {
        setShowCopyToast(false);
      }, 2500);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactType) return;

    onAddInquiry({
      listingId: listing.id,
      userId: currentUser.username,
      userName: currentUser.fullName,
      userPhone: currentUser.phone || currentUser.phoneNumber || '',
      contactType: contactType,
      message: contactMessage,
    });

    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactType(null);
    }, 2200);
  };

  const isFavorited = actualIsFavorite;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="absolute inset-0 bg-white z-40 flex flex-col overflow-hidden text-slate-800 font-sans"
      >
        {/* Toolbar Overlay Header */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-white shadow-premium transition active:scale-90 cursor-pointer tap-feedback"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleFavorite(listing.id)}
              className="w-8 h-8 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-white shadow-premium transition active:scale-90 cursor-pointer tap-feedback"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
            </button>
            <button 
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-white shadow-premium transition active:scale-90 cursor-pointer tap-feedback"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Custom Premium Toast Overlay */}
        <AnimatePresence>
          {showCopyToast && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: -10, scale: 0.95, x: '-50%' }}
              className="fixed bottom-24 left-1/2 bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-black px-4.5 py-3 rounded-full shadow-premium-lg z-50 flex items-center gap-2 border border-white/10 uppercase tracking-widest whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              <span>Havola nusxalandi!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable details wrapper */}
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-none">
          
          {/* Large Image Slideshow gallery */}
          <div className="h-[230px] relative bg-slate-100 shadow-xs border-b border-[#E2EAF8]">
            <img 
              src={listing.imageUrls[activeImageIdx] || listing.imageUrls[0]} 
              alt="Property" 
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowFullscreenGallery(true)}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>
            
            {/* Dots indicators */}
            {listing.imageUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {listing.imageUrls.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeImageIdx === i ? 'bg-slate-900 w-3.5' : 'bg-slate-400/60'}`}
                  />
                ))}
              </div>
            )}
            
            {/* Index label indicator */}
            <span className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-xs text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
              Rasm {activeImageIdx + 1} / {listing.imageUrls.length} (Kattalashtirish)
            </span>
          </div>

          {/* Core property facts */}
          <div className="p-4 space-y-4">
            
            {/* Badges and Price info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[7px] font-bold uppercase px-2 py-0.5 rounded ${
                  listing.dealType === 'sale' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {listing.dealType === 'sale' ? 'SOTISH' : 'IJARA'}
                </span>
                <span className="text-[7px] font-bold uppercase bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                  {listing.propertyType.replace('_', ' ').toUpperCase()}
                </span>
                {listing.plan === 'vip' && (
                  <span className="text-[7px] font-bold uppercase bg-amber-500/15 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded">
                    🥇 VIP RATING
                  </span>
                )}
                {listing.status === 'pending' && (
                  <span className="text-[7px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                    MODERATSIYADA
                  </span>
                )}
                {listing.status === 'rejected' && (
                  <span className="text-[7px] font-bold uppercase bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded">
                    RAD ETILGAN
                  </span>
                )}
                {listing.status === 'draft' && (
                  <span className="text-[7px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                    QORALAMA
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold leading-snug text-slate-900">{listing.title}</h2>
              
              {/* Address and Price values */}
              <div className="flex justify-between items-baseline pt-1">
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {getRegionName(listing.regionId, regions)}, {getDistrictName(listing.districtId, districts)}, {listing.address}
                </p>
                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-slate-900 block font-mono">
                    ${listing.price.toLocaleString()}
                    {listing.dealType === 'rent' && <span className="text-[10px] text-slate-400 font-normal">/oy</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid attributes: area, rooms, score rating */}
            <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-slate-100 text-center">
              <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <span className="text-[8px] text-slate-400 block uppercase font-bold">Maydoni</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{listing.area} m²</span>
              </div>
              <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <span className="text-[8px] text-slate-400 block uppercase font-bold">Xonalar</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{listing.rooms} ta</span>
              </div>
              <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                <span className="text-[8px] text-slate-400 block uppercase font-bold">Reyting score</span>
                <span className="text-xs font-bold text-yellow-500 flex items-center justify-center gap-0.5 font-mono">
                  ★ {listing.rating}
                </span>
              </div>
            </div>

            {/* Description details */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">E'lon batafsil tavsifi</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{listing.description}</p>
            </div>

            {/* Amenities Checklist details */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kommunal tarmoqlar & qulayliklar</h3>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span>🔥 Gaz ta'minoti:</span>
                  <span className="font-bold ml-auto text-slate-900">{listing.hasGas ? '✓ Bor' : '× Yo\'q'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span>⚡ Elektr tarmoqlari:</span>
                  <span className="font-bold ml-auto text-slate-900">{listing.hasElectricity ? '✓ Bor' : '× Yo\'q'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span>💧 Suv va vodoprovod:</span>
                  <span className="font-bold ml-auto text-slate-900">{listing.hasWater ? '✓ Bor' : '× Yo\'q'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span>🚽 Kanalizatsiya:</span>
                  <span className="font-bold ml-auto text-slate-900">{listing.hasSewage ? '✓ Bor' : '× Yo\'q'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span>🌐 Tezkor Internet:</span>
                  <span className="font-bold ml-auto text-slate-900">{listing.hasInternet ? '✓ Bor' : '× Yo\'q'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span>🚗 Avtoturargoh:</span>
                  <span className="font-bold ml-auto text-slate-900">{listing.hasParking ? '✓ Bor' : '× Yo\'q'}</span>
                </div>
              </div>
            </div>

            {/* Google map coordinate button */}
            <div className="pt-1">
              <a 
                href={listing.googleMapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-xl text-[10px] font-bold text-slate-700 text-center block cursor-pointer flex items-center justify-center gap-1"
              >
                📍 Google Xaritada mulk koordinatalarini ko'rish <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Realtor contact card */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-sm text-white font-bold font-display">
                {(listing.ownerName || 'SU').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">E'lon beruvchi / Realtor</h4>
                <span className="text-[11px] font-bold text-slate-900 block">{listing.ownerName}</span>
                <span className="text-[9px] text-slate-500 font-semibold block">{listing.ownerTelegram}</span>
              </div>
            </div>

            {/* SIMILAR PROPERTIES SLIDESHOW */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">O'xshash e'lonlar</h3>
              <div className="grid grid-cols-2 gap-3">
                {listings
                  .filter(l => l.id !== listing.id && l.status === 'approved' && l.dealType === listing.dealType)
                  .slice(0, 2)
                  .map(similar => (
                    <div 
                      key={similar.id}
                      onClick={() => {
                        // Switch active listing with image index reset
                        handleSelectListing(similar);
                        setActiveImageIdx(0);
                      }}
                      className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-2xs cursor-pointer hover:border-slate-300 transition"
                    >
                      <div className="h-20 w-full bg-slate-100">
                        <img src={similar.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 space-y-1 font-sans">
                        <h4 className="text-[10px] font-bold text-slate-900 line-clamp-1">{similar.title}</h4>
                        <span className="text-[10px] font-bold text-slate-900 block font-mono">${similar.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sticky footer action call buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-100 flex gap-2 z-40 shadow-lg">
          {isOwner ? (
            <>
              <button 
                onClick={() => onEditListing?.(listing)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" /> Tahrirlash
              </button>
              <button 
                onClick={async () => {
                  if (onArchiveListing) {
                    await onArchiveListing(listing.id);
                  }
                }}
                className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
              >
                {listing.status === 'draft' ? (
                  <>
                    <Globe className="w-3.5 h-3.5" /> Faollashtirish
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" /> Arxivlash
                  </>
                )}
              </button>
              <button 
                onClick={async () => {
                  if (window.confirm("Haqiqatan ham ushbu e'lonni butunlay o'chirmoqchimisiz?")) {
                    if (onDeleteListing) {
                      await onDeleteListing(listing.id);
                    }
                  }
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" /> O'chirish
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => checkProfileAndSetContact('call', `Assalomu alaykum ${listing.ownerName}, ushbu ko'chmas mulk e'loningiz bo'yicha qo'ng'iroq qilmoqdaman. Iltimos aloqaga chiqsangiz.`)}
                className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> Call (Tel)
              </button>
              <button 
                onClick={() => checkProfileAndSetContact('telegram', `Assalomu alaykum ${listing.ownerName}. Menga ushbu ko'chmas mulk e'loningiz juda yoqdi. Telegram orqali javob bersangiz.`)}
                className="flex-1 py-3 bg-[#0088cc] hover:bg-[#007cb5] rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Telegram
              </button>
              <button 
                onClick={() => checkProfileAndSetContact('whatsapp', `Assalomu alaykum. Ushbu ko'chmas mulk bo'yicha WhatsApp orqali muloqot qilmoqchi edim.`)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-750 rounded-xl text-[10px] font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </>
          )}
        </div>

        {/* Bottom Slideup contact inquiry popup form */}
        <AnimatePresence>
          {contactType && (
            <ContactModal 
              contactType={contactType}
              onClose={() => setContactType(null)}
              currentUser={currentUser}
              listing={listing}
              contactMessage={contactMessage}
              setContactMessage={setContactMessage}
              contactSuccess={contactSuccess}
              onSubmit={handleContactSubmit}
            />
          )}
        </AnimatePresence>

        {/* Fullscreen Photo Gallery Overlay popup */}
        {showFullscreenGallery && (
          <FullscreenGallery 
            isOpen={showFullscreenGallery}
            onClose={() => setShowFullscreenGallery(false)}
            listing={listing}
            activeImageIdx={activeImageIdx}
            setActiveImageIdx={setActiveImageIdx}
          />
        )}

      </motion.div>
    </AnimatePresence>
  );
}
