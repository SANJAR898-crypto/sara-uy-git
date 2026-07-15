import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Listing, User as UserType } from '../../types';

// Modal Imports
import ListingDetails from '../listings/ListingDetails';
import VerifyPhoneModal from '../modals/VerifyPhoneModal';
import CompleteProfileModal from '../modals/CompleteProfileModal';
import BuyPackageModal from '../modals/BuyPackageModal';
import StoriesPlayer from '../stories/StoriesPlayer';

interface MiniAppOverlaysProps {
  selectedListing: Listing | null;
  setSelectedListing: React.Dispatch<React.SetStateAction<Listing | null>>;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  currentUser: UserType & { phone?: string; phoneNumber?: string };
  onAddInquiry: any;
  executeProtectedAction: any;
  onDeleteListing: any;
  onUpdateListing: any;
  setEditingListing: (listing: Listing | null) => void;
  setActiveTab: (tab: any) => void;
  showVerifyPhoneModal: boolean;
  setShowVerifyPhoneModal: (val: boolean) => void;
  onVerifyPhone: any;
  onRefreshUser: any;
  showCompleteProfileModal: boolean;
  setShowCompleteProfileModal: (val: boolean) => void;
  completeProfileSuccessCallback: any;
  setCompleteProfileSuccessCallback: any;
  completeProfileActionName: string;
  handleSaveProfile: any;
  buyPackageModal: boolean;
  setBuyPackageModal: (val: boolean) => void;
  selectedPackage: any;
  setSelectedPackage: any;
  onAddPayment: any;
  activeTab: any;
  showStoriesPlayer: boolean;
  setShowStoriesPlayer: (val: boolean) => void;
  activeStoryCategory: any;
  setActiveStoryCategory: any;
  botUsername?: string;
}

export default function MiniAppOverlays({
  selectedListing,
  setSelectedListing,
  onToggleFavorite,
  favorites,
  currentUser,
  onAddInquiry,
  executeProtectedAction,
  onDeleteListing,
  onUpdateListing,
  setEditingListing,
  setActiveTab,
  showVerifyPhoneModal,
  setShowVerifyPhoneModal,
  onVerifyPhone,
  onRefreshUser,
  showCompleteProfileModal,
  setShowCompleteProfileModal,
  completeProfileSuccessCallback,
  setCompleteProfileSuccessCallback,
  completeProfileActionName,
  handleSaveProfile,
  buyPackageModal,
  setBuyPackageModal,
  selectedPackage,
  setSelectedPackage,
  onAddPayment,
  activeTab,
  showStoriesPlayer,
  setShowStoriesPlayer,
  activeStoryCategory,
  setActiveStoryCategory,
  botUsername
}: MiniAppOverlaysProps) {
  return (
    <>
      {/* MODALS & DETAILED PROPERTY VIEW OVERLAYS */}
      <AnimatePresence>
        {selectedListing && (
          <ListingDetails 
            isOpen={!!selectedListing}
            onClose={() => setSelectedListing(null)}
            listing={selectedListing}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(selectedListing.id)}
            currentUser={currentUser}
            onAddInquiry={onAddInquiry}
            onRequireProfileCompletion={executeProtectedAction}
            onDeleteListing={async (id) => {
              if (onDeleteListing) {
                await onDeleteListing(id);
              }
              setSelectedListing(null);
            }}
            onArchiveListing={async (id) => {
              if (onUpdateListing) {
                const newStatus = selectedListing.status === 'draft' ? 'pending' : 'draft';
                await onUpdateListing(id, { status: newStatus });
                setSelectedListing(prev => prev ? { ...prev, status: newStatus } : null);
              }
            }}
            onEditListing={(listing) => {
              setEditingListing(listing);
              setActiveTab('add_listing');
              setSelectedListing(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVerifyPhoneModal && (
          <VerifyPhoneModal 
            isOpen={showVerifyPhoneModal}
            onClose={() => setShowVerifyPhoneModal(false)}
            currentUser={currentUser}
            onVerifyPhone={onVerifyPhone}
            onRefreshUser={onRefreshUser}
            botUsername={botUsername}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompleteProfileModal && (
          <CompleteProfileModal 
            isOpen={showCompleteProfileModal}
            onClose={() => {
              setShowCompleteProfileModal(false);
              setCompleteProfileSuccessCallback(null);
            }}
            currentUser={currentUser}
            onRefreshUser={onRefreshUser}
            onSaveProfile={handleSaveProfile}
            actionName={completeProfileActionName}
            onSuccess={() => {
              if (completeProfileSuccessCallback && completeProfileSuccessCallback.fn) {
                completeProfileSuccessCallback.fn();
              }
              setShowCompleteProfileModal(false);
              setCompleteProfileSuccessCallback(null);
            }}
            botUsername={botUsername}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {buyPackageModal && (
          <BuyPackageModal 
            isOpen={buyPackageModal}
            onClose={() => {
              setBuyPackageModal(false);
              setSelectedPackage(null);
            }}
            selectedPackage={selectedPackage}
            currentUser={currentUser}
            onAddPayment={onAddPayment}
            onRefreshUser={onRefreshUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </AnimatePresence>

      {/* STORIES PLAYER MODAL OVERLAY */}
      <StoriesPlayer
        isOpen={showStoriesPlayer}
        category={activeStoryCategory}
        onClose={() => {
          setShowStoriesPlayer(false);
          setActiveStoryCategory(null);
        }}
      />
    </>
  );
}
