/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Listing, Inquiry, Review, Region, District, DealType, PropertyType, SubscriptionPlan, User as UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, ChevronLeft, ChevronRight, Compass, Search as SearchIcon, PlusCircle, Heart as HeartIcon, User as UserIcon } from 'lucide-react';
import { isUserProfileComplete } from '../utils/helpers';

// Modular Component Imports
import MiniAppHeader from './layout/MiniAppHeader';
import BottomNav from './layout/BottomNav';
import MiniAppOverlays from './layout/MiniAppOverlays';
import MiniAppContent from './layout/MiniAppContent';

import { DEFAULT_STORIES, StorySlide } from '../data/stories';

interface MiniAppProps {
  regions: Region[];
  districts: District[];
  listings: Listing[];
  inquiries: Inquiry[];
  reviews: Review[];
  plans?: SubscriptionPlan[];
  onToggleFavorite: (listingId: string) => void;
  onAddInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  onAddListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'viewsCount' | 'reportsCount'>) => Promise<any>;
  favorites: string[];
  currentUser: UserType & { phone?: string; phoneNumber?: string };
  initialFilters?: {
    dealType?: DealType;
    propertyType?: PropertyType;
    regionId?: string;
    districtId?: string;
    price?: number;
    rooms?: number;
    area?: number;
    additionalFilters: string[];
  } | null;
  onClearInitialFilters?: () => void;
  isAdmin?: boolean;
  onToggleAdminMode?: () => void;
  onVerifyPhone: (phone?: string) => void;
  onRefreshUser?: () => Promise<any>;
  payments: any[];
  onAddPayment: (payment: any) => Promise<any>;
  onUpdateListing?: (id: string, updates: Partial<Listing>) => Promise<any>;
  onDeleteListing?: (id: string) => Promise<any>;
  botUsername?: string;
}

export default function MiniApp({
  regions,
  districts,
  listings,
  inquiries,
  reviews,
  plans = [],
  onToggleFavorite,
  onAddInquiry,
  onAddListing,
  favorites,
  currentUser,
  initialFilters,
  onClearInitialFilters,
  onVerifyPhone,
  onRefreshUser,
  onAddPayment,
  onUpdateListing,
  onDeleteListing,
  botUsername,
}: MiniAppProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile'>('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Verification & Package states
  const [showVerifyPhoneModal, setShowVerifyPhoneModal] = useState(false);
  const [buyPackageModal, setBuyPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'premium' | 'vip' | null>(null);

  // Profile completion states
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [completeProfileActionName, setCompleteProfileActionName] = useState("");
  const [completeProfileSuccessCallback, setCompleteProfileSuccessCallback] = useState<{ fn: () => void } | null>(null);

  const executeProtectedAction = (actionName: string, actionCallback: () => void) => {
    const isProfileComplete = isUserProfileComplete(currentUser);

    if (!isProfileComplete) {
      setCompleteProfileActionName(actionName);
      setCompleteProfileSuccessCallback({ fn: actionCallback });
      setShowCompleteProfileModal(true);
    } else {
      actionCallback();
    }
  };

  const handleSaveProfile = async (newFullName: string) => {
    try {
      const updatedUser = {
        ...currentUser,
        fullName: newFullName
      };
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      if (res.ok) {
        if (onRefreshUser) {
          await onRefreshUser();
        }
      }
    } catch (e) {
      console.error("Save profile failed:", e);
    }
  };

  // Stories States
  const [showStoriesPlayer, setShowStoriesPlayer] = useState(false);
  const [activeStoryCategory, setActiveStoryCategory] = useState<string | null>(null);

  // Deep Link Filters Handler
  useEffect(() => {
    if (initialFilters) {
      setActiveTab('search');
    }
  }, [initialFilters]);

  // Derived Values
  const isSubscriptionActive = currentUser && currentUser.packageId && currentUser.packageExpiresAt && new Date(currentUser.packageExpiresAt) > new Date();

  const handleStartStories = (category: string) => {
    setActiveStoryCategory(category);
    setShowStoriesPlayer(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFBFD] pb-28 font-sans select-none relative overflow-x-hidden text-slate-800">
      
      {/* 1. HEADER SECTION WITH PREMIUM METALLIC GRADIENT AND DEPTH */}
      <MiniAppHeader currentUser={currentUser} isSubscriptionActive={isSubscriptionActive} />

      {/* 2. DYNAMIC CONTENT INNER SECTION */}
      <div className="px-4 -mt-5">
        <AnimatePresence mode="wait">
          <MiniAppContent 
            activeTab={activeTab}
            listings={listings}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            setSelectedListing={setSelectedListing}
            onStartStories={handleStartStories}
            regions={regions}
            districts={districts}
            initialFilters={initialFilters}
            onClearInitialFilters={onClearInitialFilters}
            currentUser={currentUser}
            onAddListing={onAddListing}
            onRefreshUser={onRefreshUser}
            onAddPayment={onAddPayment}
            setActiveTab={setActiveTab}
            setSelectedPackage={setSelectedPackage}
            setBuyPackageModal={setBuyPackageModal}
            editingListing={editingListing}
            onUpdateListing={onUpdateListing}
            setEditingListing={setEditingListing}
            executeProtectedAction={executeProtectedAction}
          />
        </AnimatePresence>
      </div>

      {/* 3. PERSISTENT FLOATING NAVIGATION TAB BAR WITH PREMIUM GLASSMORPHISM AND INTEGRATED IOS SAFE AREA */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onProtectedTabClick={executeProtectedAction} 
        setSelectedListing={setSelectedListing} 
      />

      {/* 4. MODALS & DETAILED PROPERTY VIEW OVERLAYS */}
      <MiniAppOverlays 
        selectedListing={selectedListing}
        setSelectedListing={setSelectedListing}
        onToggleFavorite={onToggleFavorite}
        favorites={favorites}
        currentUser={currentUser}
        onAddInquiry={onAddInquiry}
        executeProtectedAction={executeProtectedAction}
        onDeleteListing={onDeleteListing}
        onUpdateListing={onUpdateListing}
        setEditingListing={setEditingListing}
        setActiveTab={setActiveTab}
        showVerifyPhoneModal={showVerifyPhoneModal}
        setShowVerifyPhoneModal={setShowVerifyPhoneModal}
        onVerifyPhone={onVerifyPhone}
        onRefreshUser={onRefreshUser}
        botUsername={botUsername}
        showCompleteProfileModal={showCompleteProfileModal}
        setShowCompleteProfileModal={setShowCompleteProfileModal}
        completeProfileSuccessCallback={completeProfileSuccessCallback}
        setCompleteProfileSuccessCallback={setCompleteProfileSuccessCallback}
        completeProfileActionName={completeProfileActionName}
        handleSaveProfile={handleSaveProfile}
        buyPackageModal={buyPackageModal}
        setBuyPackageModal={setBuyPackageModal}
        selectedPackage={selectedPackage}
        setSelectedPackage={setSelectedPackage}
        onAddPayment={onAddPayment}
        activeTab={activeTab}
        showStoriesPlayer={showStoriesPlayer}
        setShowStoriesPlayer={setShowStoriesPlayer}
        activeStoryCategory={activeStoryCategory}
        setActiveStoryCategory={setActiveStoryCategory}
      />

    </div>
  );
}
