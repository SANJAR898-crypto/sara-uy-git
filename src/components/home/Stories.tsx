import React from 'react';
import { Sparkles, Building, DollarSign, Lightbulb, Map } from 'lucide-react';

interface StorySlide {
  id: string;
  title: string;
  price?: string;
  imageUrl: string;
  desc?: string;
  listingId?: string;
  ownerPhone?: string;
}

interface StoriesProps {
  onSelectCategory: (category: 'villas' | 'apartments' | 'cheap' | 'tips') => void;
  onOpenMap: () => void;
  onShowPlanModal: () => void;
  customStories?: Record<string, StorySlide[]>;
  defaultStories: Record<string, StorySlide[]>;
}

export default function Stories({
  onSelectCategory,
  onOpenMap,
  onShowPlanModal,
  customStories = {},
  defaultStories
}: StoriesProps) {
  
  const getCombinedSlides = (cat: 'villas' | 'apartments' | 'cheap' | 'tips'): StorySlide[] => {
    const defaults = defaultStories[cat] || [];
    const customs = customStories[cat] || [];
    return [...defaults, ...customs];
  };

  const storyItems = [
    {
      id: 'villas',
      label: 'Villalar',
      icon: Sparkles,
      gradient: 'from-amber-50 to-amber-100/50',
      iconColor: 'text-amber-600',
      ringColor: 'from-amber-400 to-yellow-500',
      badge: getCombinedSlides('villas').length,
    },
    {
      id: 'apartments',
      label: 'Kvartiralar',
      icon: Building,
      gradient: 'from-blue-50 to-blue-100/50',
      iconColor: 'text-blue-600',
      ringColor: 'from-blue-400 to-indigo-500',
      badge: getCombinedSlides('apartments').length,
    },
    {
      id: 'cheap',
      label: 'Arzon',
      icon: DollarSign,
      gradient: 'from-emerald-50 to-emerald-100/50',
      iconColor: 'text-emerald-600',
      ringColor: 'from-emerald-400 to-teal-500',
      badge: getCombinedSlides('cheap').length,
    },
    {
      id: 'tips',
      label: 'Maslahatlar',
      icon: Lightbulb,
      gradient: 'from-slate-50 to-slate-100/50',
      iconColor: 'text-slate-600',
      ringColor: 'from-slate-400 to-slate-600',
      badge: getCombinedSlides('tips').length,
    },
    {
      id: 'xarita',
      label: 'Xarita',
      icon: Map,
      gradient: 'from-sky-50 to-sky-100/50',
      iconColor: 'text-sky-600',
      ringColor: 'from-sky-400 to-cyan-500',
      badge: 0,
    }
  ];

  return (
    <div className="space-y-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] font-sans">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-base">🔥</span>
          <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase">Mashhur bo'limlar</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Yangi hikoyalar ko'ring</span>
      </div>
      
      {/* Horizontal Scrollable Circular Row with Native momentum scrolling and tap-feedback */}
      <div className="flex items-center gap-4.5 overflow-x-auto pb-1 scrollbar-none snap-x px-1 scroll-bounce">
        {storyItems.map(item => {
          const IconComponent = item.icon;
          return (
            <div 
              key={item.id}
              onClick={() => {
                if (item.id === 'xarita') {
                  onOpenMap();
                } else {
                  const slides = getCombinedSlides(item.id as any);
                  if (slides.length > 0) {
                    onSelectCategory(item.id as any);
                  } else {
                    alert(`Hozirda "${item.label}" bo'limida yangi hikoyalar yo'q. E'loningizni shu yerda reklama qilish uchun "Story" tarifini sotib oling!`);
                    onShowPlanModal();
                  }
                }
              }}
              className="flex flex-col items-center gap-2 shrink-0 cursor-pointer snap-start group tap-feedback"
            >
              <div className="relative">
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 z-10 min-w-4.5 h-4.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-md">
                    {item.badge}
                  </span>
                )}
                {/* Glowing border if stories exist */}
                <div className={`w-15 h-15 rounded-full p-[2px] ${item.badge > 0 ? `bg-gradient-to-tr ${item.ringColor} shadow-[0_4px_12px_rgba(0,0,0,0.05)]` : 'bg-slate-200/50'} transition-all duration-300 group-hover:scale-105`}>
                  <div className={`w-full h-full rounded-full bg-gradient-to-tr ${item.gradient} flex items-center justify-center shadow-inner border border-white`}>
                    <IconComponent className={`w-5.5 h-5.5 ${item.iconColor}`} />
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 tracking-tight group-hover:text-blue-600 transition-all">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
