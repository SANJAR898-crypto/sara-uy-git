import React from 'react';
import { Compass, Search, Heart, PlusCircle, Clock, User } from 'lucide-react';
import { User as UserType } from '../../types';

interface BottomNavigationProps {
  activeTab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile';
  onTabChange: (tab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile') => void;
  currentUser: UserType & { phone?: string };
  onShowVerifyModal: () => void;
  onClearSelectedListing?: () => void;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  currentUser,
  onShowVerifyModal,
  onClearSelectedListing
}: BottomNavigationProps) {
  
  const tabs = [
    { id: 'home', icon: Compass, label: 'Asosiy' },
    { id: 'search', icon: Search, label: 'Qidirish' },
    { id: 'favorites', icon: Heart, label: 'Sevimlilar' },
    { id: 'add_listing', icon: PlusCircle, label: 'E\'lon berish' },
    { id: 'my_listings', icon: Clock, label: 'Mening uylarim' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-30 flex justify-around items-center px-1 py-2 bg-white border-t border-[#E2EAF8] shadow-[0_-4px_15px_rgba(0,102,204,0.03)] font-sans shrink-0">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (onClearSelectedListing) onClearSelectedListing();
              
              if (tab.id === 'add_listing') {
                const userPhoneVal = currentUser.phoneNumber || currentUser.phone;
                const hasVerifiedPhone = userPhoneVal && userPhoneVal.trim() !== '' && userPhoneVal !== '+998 90 000 00 00';
                if (!hasVerifiedPhone) {
                  onShowVerifyModal();
                  return;
                }
              }
              onTabChange(tab.id as any);
            }}
            className={`flex flex-col items-center gap-0.5 justify-center transition-all duration-300 py-1 cursor-pointer ${
              isActive ? 'text-[#0082D5] scale-105' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-[7px] font-extrabold uppercase tracking-wider block">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
