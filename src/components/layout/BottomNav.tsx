import React from 'react';
import { Compass, Search as SearchIcon, PlusCircle, Heart as HeartIcon, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile';
  onTabChange: (tab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile') => void;
  onProtectedTabClick: (actionName: string, successCallback: () => void) => void;
  setSelectedListing: (val: any) => void;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onProtectedTabClick,
  setSelectedListing
}: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Compass, label: 'Asosiy' },
    { id: 'search', icon: SearchIcon, label: 'Qidiruv' },
    { id: 'add_listing', icon: PlusCircle, label: "E'lon" },
    { id: 'favorites', icon: HeartIcon, label: 'Saralangan' },
    { id: 'profile', icon: UserIcon, label: 'Profil' }
  ];

  return (
    <div className="fixed bottom-5 inset-x-4 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/50 px-4 py-2.5 flex justify-between items-center z-40 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[20px] font-sans">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = activeTab === tab.id || (tab.id === 'profile' && activeTab === 'my_listings');
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedListing(null);
              if (tab.id === 'add_listing') {
                onProtectedTabClick("E'lon berish", () => {
                  onTabChange('add_listing');
                });
              } else {
                onTabChange(tab.id as any);
              }
            }}
            className="flex flex-col items-center gap-1.5 relative py-1 focus:outline-none shrink-0 cursor-pointer"
            style={{ width: '56px' }}
          >
            <Icon className={`w-5 h-5 transition-all duration-300 ${isSelected ? 'text-slate-900 scale-105' : 'text-slate-400 hover:text-slate-600'}`} />
            <span className={`text-[8px] font-bold tracking-wider transition-all uppercase leading-none ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
              {tab.label}
            </span>
            {isSelected && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute -bottom-1.5 w-4 h-[3px] bg-slate-900 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
