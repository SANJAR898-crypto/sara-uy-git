import React from 'react';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import { User as UserType } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile';
  onTabChange: (tab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile') => void;
  currentUser: UserType & { phone?: string };
  onShowVerifyModal: () => void;
  onClearSelectedListing?: () => void;
  bgWhite?: boolean;
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
  currentUser,
  onShowVerifyModal,
  onClearSelectedListing,
  bgWhite = false
}: LayoutProps) {
  return (
    <div className={`w-full flex flex-col min-h-[728px] ${bgWhite ? 'bg-white' : 'bg-slate-50'} text-slate-800 relative select-none font-sans`}>
      <Header />
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 relative z-10 scrollbar-none">
        {children}
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentUser={currentUser}
        onShowVerifyModal={onShowVerifyModal}
        onClearSelectedListing={onClearSelectedListing}
      />
    </div>
  );
}
