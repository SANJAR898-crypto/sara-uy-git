import React, { useState, useEffect } from 'react';
import { Award, Zap, Building, Building2, Home as HomeIcon, Layers, Map, Briefcase, Grid, Settings, MapPin, Heart, Star, ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { Listing, District, Region, Review } from '../../types';
import Stories from './Stories';
import VIPBanner from './VIPBanner';
import ListingCard from '../listings/ListingCard';

interface HomeProps {
  listings: Listing[];
  districts?: District[];
  regions?: Region[];
  reviews?: Review[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  currentUser?: any;
  
  // Navigation states
  onTabChange?: (tab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile') => void;
  
  // Stories & pricing plans
  onSelectCategory?: (category: 'villas' | 'apartments' | 'cheap' | 'tips') => void;
  onStartStories?: (category: 'villas' | 'apartments' | 'cheap' | 'tips' | any) => void;
  onShowPlanModal?: () => void;
  customStories?: Record<string, any[]>;
  defaultStories?: Record<string, any[]>;
  
  // Shared Filter States from MiniApp/Parent
  selectedPropertyType?: 'all' | 'apartment' | 'house' | 'new_building' | 'land' | 'commercial';
  setSelectedPropertyType?: (type: 'all' | 'apartment' | 'house' | 'new_building' | 'land' | 'commercial') => void;
  selectedDealType?: 'all' | 'sale' | 'rent';
  setSelectedDealType?: (dealType: 'all' | 'sale' | 'rent') => void;
}

const LOCAL_DEFAULT_STORIES: Record<string, any[]> = {
  villas: [
    {
      id: 'sv-1',
      title: "Ko'kaldosh sohilidagi dabdabali shinam villa",
      price: "$450,000",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      desc: "8 xona, 12 sotix, qishki va yozgi basseyn, sauna, lof uslubidagi ta'mir. Juda nufuzli hududda joyhazlangan.",
      ownerPhone: "+998 90 999 11 22"
    },
    {
      id: 'sv-2',
      title: "Qibrayda 8 sotixli yevro-villa yangi uy",
      price: "$280,000",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      desc: "Yevropacha dizayn, eng sifatli qurilish materiallari, mebellar va texnikalar to'liq jihozlangan.",
      ownerPhone: "+998 91 777 88 99"
    }
  ],
  apartments: [
    {
      id: 'sa-1',
      title: "Tashkent City - Gardens Residence penthouse",
      price: "$185,000",
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      desc: "Tashkent City qoq markazida, 4 xonali premium xonadon. Panoramic manzara, shaxsiy terassa, yuqori xavfsizlik.",
      ownerPhone: "+998 90 321 00 99"
    }
  ],
  cheap: [],
  tips: [
    {
      id: 'st-1',
      title: "Ko'chmas mulk sotib olishda 5 ta oltin qoida",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      desc: "1. Hujjatlarni yurist orqali tekshiring. 2. Hududni yaxshilab o'rganing. 3. Qo'shnilardan so'rang. 4. Kommunikatsiyalarni tekshiring. 5. Bozordagi o'rtacha narxni solishtiring."
    }
  ]
};

export default function Home({
  listings,
  districts = [],
  regions = [],
  reviews = [],
  favorites,
  onToggleFavorite,
  onSelectListing,
  onTabChange = () => {},
  onSelectCategory,
  onStartStories,
  onShowPlanModal = () => {},
  customStories = {},
  defaultStories = LOCAL_DEFAULT_STORIES,
  selectedPropertyType,
  setSelectedPropertyType,
  selectedDealType,
  setSelectedDealType,
  currentUser
}: HomeProps) {

  // Local state fallbacks for filter variables if not passed from parent
  const [localPropertyType, setLocalPropertyType] = useState<'all' | 'apartment' | 'house' | 'new_building' | 'land' | 'commercial'>('all');
  const [localDealType, setLocalDealType] = useState<'all' | 'sale' | 'rent'>('all');

  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsRecsLoading(true);
      try {
        const userId = currentUser?.telegramId || '';
        const res = await fetch(`/api/recommendations?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.warn('Failed to load smart recommendations:', err);
      } finally {
        setIsRecsLoading(false);
      }
    };
    fetchRecommendations();
  }, [currentUser, listings]);

  const currentPropertyType = selectedPropertyType !== undefined ? selectedPropertyType : localPropertyType;
  const currentSetPropertyType = setSelectedPropertyType !== undefined ? setSelectedPropertyType : setLocalPropertyType;

  const currentDealType = selectedDealType !== undefined ? selectedDealType : localDealType;
  const currentSetDealType = setSelectedDealType !== undefined ? setSelectedDealType : setLocalDealType;

  const handleSelectCategory = (category: 'villas' | 'apartments' | 'cheap' | 'tips') => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else if (onStartStories) {
      onStartStories(category);
    }
  };

  const approvedListings = listings.filter(l => l.status === 'approved');
  const vipListings = approvedListings.filter(l => l.plan === 'vip');
  const premiumListings = approvedListings.filter(l => l.plan === 'premium');

  return (
    <div className="space-y-6 font-sans">
      
      {/* MASHHUR BO'LIMLAR / STORIES NAVIGATION BAR */}
      <Stories
        onSelectCategory={handleSelectCategory}
        onOpenMap={() => {
          currentSetPropertyType('all');
          onTabChange('search');
        }}
        onShowPlanModal={onShowPlanModal}
        customStories={customStories}
        defaultStories={defaultStories}
      />

      {/* VIP AUTOPLAY HERO BANNER SLIDER */}
      <VIPBanner
        vipListings={vipListings}
        districts={districts}
        onSelectListing={onSelectListing}
      />

      {/* QUICK SEARCH */}
      <div 
        onClick={() => onTabChange('search')}
        className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all duration-300 tap-feedback"
      >
        <Search className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-400 flex-1 font-medium">Barcha ko'chmas mulklarni qidirish...</span>
        <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
          <Settings className="w-4 h-4" />
        </div>
      </div>

      {/* DEAL TYPE QUICK SWITCH */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { currentSetDealType('sale'); onTabChange('search'); }}
          className="bg-white border border-slate-100 rounded-2xl p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-blue-100 transition-all duration-300 flex flex-col items-start group cursor-pointer tap-feedback relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-blue-50/50 border border-blue-100/50 rounded-xl flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-105">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight block">Sotuvdagi uylar</span>
          <span className="text-[10px] font-semibold text-slate-400 block mt-1 uppercase tracking-wider">Sotib olish</span>
        </button>
        <button 
          onClick={() => { currentSetDealType('rent'); onTabChange('search'); }}
          className="bg-white border border-slate-100 rounded-2xl p-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-emerald-100 transition-all duration-300 flex flex-col items-start group cursor-pointer tap-feedback relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-emerald-50/50 border border-emerald-100/50 rounded-xl flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-105">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight block">Ijaradagi uylar</span>
          <span className="text-[10px] font-semibold text-slate-400 block mt-1 uppercase tracking-wider">Ijara / Arenda</span>
        </button>
      </div>

      {/* PROPERTY CATEGORIES */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Ko'chmas mulk toifalari</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'apartment', label: 'Kvartiralar', icon: Building2 },
            { id: 'house', label: 'Hovli', icon: HomeIcon },
            { id: 'new_building', label: 'Novostroyka', icon: Layers },
            { id: 'land', label: 'Er uchastkalari', icon: Map },
            { id: 'commercial', label: 'Tijoriy mulk', icon: Briefcase },
            { id: 'all', label: 'Barchasi', icon: Grid },
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = currentPropertyType === cat.id;
            return (
              <button 
                key={cat.id}
                onClick={() => {
                  currentSetPropertyType(cat.id as any);
                  onTabChange('search');
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] cursor-pointer tap-feedback ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                    : 'bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-white' : 'text-slate-700'}`} />
                <span className="text-[10px] font-bold block leading-none tracking-tight uppercase mt-0.5">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIP LISTINGS SECTION */}
      {vipListings.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> VIP E'LONLAR
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top darajadagi uylar</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {vipListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                onSelectListing={onSelectListing}
                districts={districts}
                isVip={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* PREMIUM LISTINGS SECTION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-blue-600" /> PREMIUM E'LONLAR
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mashhur va sifatli uylar</span>
        </div>
        
        {premiumListings.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium">
            Hozirda Premium e'lonlar mavjud emas.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {premiumListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                onSelectListing={onSelectListing}
                districts={districts}
                isPremium={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* SMART AI RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gradient-to-r from-violet-50 to-indigo-50/50 p-3.5 rounded-2xl border border-violet-100/50 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider">SIZ UCHUN AQLLI TAVSIYALAR</h3>
                <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">AI sizning qiziqishlaringizga moslashtirdi</p>
              </div>
            </div>
            <span className="text-[8px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Gemini AI</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recommendations.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                onSelectListing={onSelectListing}
                districts={districts}
              />
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER REVIEWS */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mijozlarimiz fikrlari</h3>
        <div className="space-y-3">
          {reviews.slice(0, 2).map((rev, idx) => (
            <div key={rev.id || idx} className="bg-white border border-slate-100 rounded-2xl p-4.5 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-800">
                  {rev.userName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-none">{rev.userName}</h4>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-1">Tasdiqlangan Mijoz</span>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PARTNERS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ishonchli hamkorlarimiz</h3>
        <div className="grid grid-cols-3 gap-2.5 py-1">
          {['Murad Buildings', 'Golden House', 'Tashkent City'].map((pName, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
              <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wide">{pName}</span>
              <span className="text-[8px] text-emerald-600 font-bold block uppercase tracking-wider mt-0.5">✓ Partner</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900 rounded-2xl p-4.5 text-white text-center shadow-lg border border-slate-800">
        <div className="space-y-0.5">
          <span className="text-sm font-bold block">1,200+</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Mulk e'lonlari</span>
        </div>
        <div className="space-y-0.5 border-x border-slate-800">
          <span className="text-sm font-bold block">98%</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Yaxshi fikrlar</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-sm font-bold block">24/7</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Call Markazi</span>
        </div>
      </div>

      {/* FOOTER COOPERATE */}
      <footer className="text-center space-y-1.5 pt-6 pb-4 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">© 2026 SARA UYLAR</p>
        <p className="text-[8px] text-slate-400 leading-relaxed">Developed completely by SARA UYLAR. All rights reserved.</p>
      </footer>

    </div>
  );
}
