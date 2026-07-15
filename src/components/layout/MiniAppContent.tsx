import React from 'react';
import { motion } from 'motion/react';
import { Listing, Region, District, User as UserType } from '../../types';

// Tab Components
import Home from '../home/Home';
import Search from '../search/Search';
import Favorites from '../profile/Favorites';
import ListingForm from '../listings/ListingForm';
import MyListings from '../listings/MyListings';
import Profile from '../profile/Profile';

interface MiniAppContentProps {
  activeTab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile';
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  setSelectedListing: (listing: Listing | null) => void;
  onStartStories: (category: string) => void;
  regions: Region[];
  districts: District[];
  initialFilters: any;
  onClearInitialFilters: any;
  currentUser: UserType & { phone?: string; phoneNumber?: string };
  onAddListing: any;
  onRefreshUser: any;
  onAddPayment: any;
  setActiveTab: (tab: any) => void;
  setSelectedPackage: (pkg: any) => void;
  setBuyPackageModal: (val: boolean) => void;
  editingListing: Listing | null;
  onUpdateListing: any;
  setEditingListing: (listing: Listing | null) => void;
  executeProtectedAction: (actionName: string, actionCallback: () => void) => void;
}

export default function MiniAppContent({
  activeTab,
  listings,
  favorites,
  onToggleFavorite,
  setSelectedListing,
  onStartStories,
  regions,
  districts,
  initialFilters,
  onClearInitialFilters,
  currentUser,
  onAddListing,
  onRefreshUser,
  onAddPayment,
  setActiveTab,
  setSelectedPackage,
  setBuyPackageModal,
  editingListing,
  onUpdateListing,
  setEditingListing,
  executeProtectedAction
}: MiniAppContentProps) {
  const transitionSettings = { duration: 0.25 };
  const animationVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  switch (activeTab) {
    case 'home':
      return (
        <motion.div key="home" {...animationVariants} transition={transitionSettings}>
          <Home 
            listings={listings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={setSelectedListing}
            onStartStories={onStartStories}
            currentUser={currentUser}
            districts={districts}
            regions={regions}
          />
        </motion.div>
      );

    case 'search':
      return (
        <motion.div key="search" {...animationVariants} transition={transitionSettings} className="w-full">
          <Search 
            regions={regions}
            districts={districts}
            listings={listings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={setSelectedListing}
            initialFilters={initialFilters}
            onClearInitialFilters={onClearInitialFilters}
          />
        </motion.div>
      );

    case 'favorites':
      return (
        <motion.div key="favorites" {...animationVariants} transition={transitionSettings}>
          <Favorites 
            listings={listings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onSelectListing={setSelectedListing}
            districts={districts}
          />
        </motion.div>
      );

    case 'add_listing':
      return (
        <motion.div key="add_listing" {...animationVariants} transition={transitionSettings}>
          <ListingForm 
            regions={regions}
            districts={districts}
            currentUser={currentUser}
            listings={listings}
            onAddListing={onAddListing}
            onRefreshUser={onRefreshUser}
            onAddPayment={onAddPayment}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onUpgradePrompt={(pkg) => {
              setSelectedPackage(pkg);
              setBuyPackageModal(true);
            }}
            editingListing={editingListing}
            onUpdateListing={async (id, updates) => {
              if (onUpdateListing) {
                await onUpdateListing(id, updates);
              }
              setEditingListing(null);
            }}
            onCancelEdit={() => {
              setEditingListing(null);
              setActiveTab('my_listings');
            }}
          />
        </motion.div>
      );

    case 'my_listings':
      return (
        <motion.div key="my_listings" {...animationVariants} transition={transitionSettings}>
          <MyListings 
            listings={listings}
            currentUser={currentUser}
            onSelectListing={setSelectedListing}
          />
        </motion.div>
      );

    case 'profile':
      return (
        <motion.div key="profile" {...animationVariants} transition={transitionSettings}>
          <Profile 
            currentUser={currentUser}
            listings={listings}
            onVerifyClick={() => {
              executeProtectedAction("Hisobni tasdiqlash", () => {});
            }}
            onBuyPackageClick={(pkg) => {
              executeProtectedAction("Tarif sotib olish", () => {
                setSelectedPackage(pkg);
                setBuyPackageModal(true);
              });
            }}
          />
        </motion.div>
      );

    default:
      return null;
  }
}
