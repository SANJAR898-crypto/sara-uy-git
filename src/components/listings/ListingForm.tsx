import React, { useState, useEffect } from 'react';
import { PlusCircle, X, CheckCircle, Edit3 } from 'lucide-react';
import { Region, District, Listing, User as UserType, PropertyType, DealType } from '../../types';
import { compressAndProcessFile } from '../../utils/helpers';
import LimitExceededView from './LimitExceededView';
import ListingImageUploader from './ListingImageUploader';
import ListingFeaturesSelector from './ListingFeaturesSelector';
import ListingBasicDetailsForm from './ListingBasicDetailsForm';

interface ListingFormProps {
  regions: Region[];
  districts: District[];
  listings: Listing[];
  currentUser: UserType & { phone?: string };
  onAddListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'viewsCount' | 'reportsCount'>) => Promise<any>;
  onOpenPackageShop?: (recommendedPlan: 'standard' | 'premium' | 'vip') => void;
  onShowPlanSelection?: (formData: any) => void;
  formSubmitted?: boolean;
  setFormSubmitted?: (val: boolean) => void;
  onRefreshUser?: () => Promise<any>;
  onAddPayment?: (payment: any) => Promise<any>;
  activeTab?: string;
  setActiveTab?: (tab: 'home' | 'search' | 'favorites' | 'add_listing' | 'my_listings' | 'profile' | any) => void;
  onUpgradePrompt?: (pkg: 'standard' | 'premium' | 'vip') => void;
  editingListing?: Listing | null;
  onUpdateListing?: (id: string, updates: Partial<Listing>) => Promise<any>;
  onCancelEdit?: () => void;
}

export default function ListingForm({
  regions,
  districts,
  listings,
  currentUser,
  onAddListing,
  onOpenPackageShop,
  onShowPlanSelection,
  formSubmitted,
  setFormSubmitted,
  onRefreshUser,
  onAddPayment,
  activeTab,
  setActiveTab,
  onUpgradePrompt,
  editingListing,
  onUpdateListing,
  onCancelEdit
}: ListingFormProps) {

  const triggerOpenPackageShop = (plan: 'standard' | 'premium' | 'vip') => {
    if (onOpenPackageShop) {
      onOpenPackageShop(plan);
    } else if (onUpgradePrompt) {
      onUpgradePrompt(plan);
    }
  };

  const userListingsCount = listings.filter(l => {
    const userUname = (currentUser.username || '').toLowerCase().replace('@', '');
    const userPhone = (currentUser.phone || currentUser.phoneNumber || '').replace(/[^0-9]/g, '');
    const userTgId = (currentUser.telegramId || '').toString();

    const listingUname = (l.ownerTelegram || '').toLowerCase().replace('@', '');
    const listingPhone = (l.ownerPhone || '').replace(/[^0-9]/g, '');

    return (userUname && listingUname === userUname) ||
           (userPhone && listingPhone === userPhone) ||
           (userTgId && listingUname === userTgId);
  }).length;

  const isSubscriptionActive = currentUser.packageExpiresAt && new Date(currentUser.packageExpiresAt).getTime() > Date.now();
  
  let maxListings = 1;
  if (isSubscriptionActive) {
    if (currentUser.packageId === 'standard') maxListings = 5;
    else if (currentUser.packageId === 'premium') maxListings = 10;
    else if (currentUser.packageId === 'vip') maxListings = 50;
  }

  // Local Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDealType, setFormDealType] = useState<DealType>('sale');
  const [formPropertyType, setFormPropertyType] = useState<PropertyType>('apartment');
  const [formRegionId, setFormRegionId] = useState(regions[0]?.id || 'tashkent');
  const [formDistrictId, setFormDistrictId] = useState(districts.filter(d => d.regionId === (regions[0]?.id || 'tashkent'))[0]?.id || 'yunasabad');
  const [formAddress, setFormAddress] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formRooms, setFormRooms] = useState('');
  const [formFloor, setFormFloor] = useState('');
  const [formMaxFloors, setFormMaxFloors] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [formVideoUrl, setFormVideoUrl] = useState('');

  const [formHasGas, setFormHasGas] = useState(true);
  const [formHasElectricity, setFormHasElectricity] = useState(true);
  const [formHasWater, setFormHasWater] = useState(true);
  const [formHasSewage, setFormHasSewage] = useState(true);
  const [formHasInternet, setFormHasInternet] = useState(true);
  const [formHasParking, setFormHasParking] = useState(true);
  const [formHasFurniture, setFormHasFurniture] = useState(false);
  const [formHasSecurity, setFormHasSecurity] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  // Sync editing fields
  useEffect(() => {
    if (editingListing) {
      setFormTitle(editingListing.title || '');
      setFormDealType(editingListing.dealType || 'sale');
      setFormPropertyType(editingListing.propertyType || 'apartment');
      setFormRegionId(editingListing.regionId || '');
      setFormDistrictId(editingListing.districtId || '');
      setFormAddress(editingListing.address || '');
      setFormPrice((editingListing.price || '').toString());
      setFormArea((editingListing.area || '').toString());
      setFormRooms((editingListing.rooms || '').toString());
      setFormFloor((editingListing.floor || '').toString());
      setFormMaxFloors((editingListing.maxFloors || '').toString());
      setFormDescription(editingListing.description || '');
      setFormImageUrls(editingListing.imageUrls || []);
      setFormVideoUrl(editingListing.videoUrl || '');
      
      setFormHasGas(editingListing.hasGas ?? true);
      setFormHasElectricity(editingListing.hasElectricity ?? true);
      setFormHasWater(editingListing.hasWater ?? true);
      setFormHasSewage(editingListing.hasSewage ?? true);
      setFormHasInternet(editingListing.hasInternet ?? true);
      setFormHasParking(editingListing.hasParking ?? true);
      setFormHasFurniture(editingListing.hasFurniture ?? false);
      setFormHasSecurity(editingListing.hasSecurity ?? false);
    } else {
      setFormTitle('');
      setFormDealType('sale');
      setFormPropertyType('apartment');
      setFormRegionId(regions[0]?.id || 'tashkent');
      setFormDistrictId(districts.filter(d => d.regionId === (regions[0]?.id || 'tashkent'))[0]?.id || 'yunasabad');
      setFormAddress('');
      setFormPrice('');
      setFormArea('');
      setFormRooms('');
      setFormFloor('');
      setFormMaxFloors('');
      setFormDescription('');
      setFormImageUrls([]);
      setFormVideoUrl('');
      
      setFormHasGas(true);
      setFormHasElectricity(true);
      setFormHasWater(true);
      setFormHasSewage(true);
      setFormHasInternet(true);
      setFormHasParking(true);
      setFormHasFurniture(false);
      setFormHasSecurity(false);
    }
  }, [editingListing, regions, districts]);

  const processFiles = (files: FileList) => {
    const remainingSlots = 20 - formImageUrls.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];

    filesToProcess.forEach((file: File) => {
      compressAndProcessFile(file, (base64) => {
        setFormImageUrls(prev => [...prev, base64]);
      });
    });
  };

  // File Upload with client side scaling and compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    processFiles(files);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setFormImageUrls(prev => {
      const updated = [...prev];
      const target = updated.splice(index, 1)[0];
      return [target, ...updated];
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formImageUrls.length) return;

    setFormImageUrls(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleDeleteImage = (index: number) => {
    setFormImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAddress.trim() || !formPrice || !formArea || !formRooms) {
      alert("Iltimos, barcha majburiy ma'lumotlarni to'ldiring!");
      return;
    }
    if (formImageUrls.length === 0) {
      alert("Iltimos, kamida bitta rasm yuklang!");
      return;
    }

    const parsedPrice = parseFloat(formPrice) || 0;
    const parsedArea = parseFloat(formArea) || 0;
    const parsedRooms = parseInt(formRooms) || 1;
    const parsedFloor = formFloor ? parseInt(formFloor) : undefined;
    const parsedMaxFloors = formMaxFloors ? parseInt(formMaxFloors) : undefined;

    const updatedData: Partial<Listing> = {
      title: formTitle,
      dealType: formDealType,
      propertyType: formPropertyType,
      regionId: formRegionId,
      districtId: formDistrictId,
      address: formAddress,
      price: parsedPrice,
      area: parsedArea,
      rooms: parsedRooms,
      floor: parsedFloor,
      maxFloors: parsedMaxFloors,
      description: formDescription,
      hasGas: formHasGas,
      hasElectricity: formHasElectricity,
      hasWater: formHasWater,
      hasSewage: formHasSewage,
      hasInternet: formHasInternet,
      hasParking: formHasParking,
      hasFurniture: formHasFurniture,
      hasSecurity: formHasSecurity,
      imageUrls: formImageUrls.length > 0 ? formImageUrls : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
      videoUrl: formVideoUrl || undefined,
    };

    if (editingListing) {
      try {
        if (onUpdateListing) {
          await onUpdateListing(editingListing.id, updatedData);
        }
        alert("E'loningiz muvaffaqiyatli tahrirlandi!");
        if (onCancelEdit) {
          onCancelEdit();
        } else if (setActiveTab) {
          setActiveTab('my_listings');
        }
      } catch (err) {
        console.error("Error updating listing:", err);
        alert("Tahrirlashda xatolik yuz berdi.");
      }
      return;
    }

    // Verify active subscription
    if (userListingsCount >= 1 && !isSubscriptionActive) {
      alert("Sizning birinchi e'loningiz bepul edi. Keyingi e'lonlarni joylashtirish uchun faol obunaga ega bo'lishingiz kerak. Iltimos, quyidagi oynadan mos tarifni tanlab xarid qiling.");
      triggerOpenPackageShop('standard');
      return;
    }

    const limitExceeded = (!isSubscriptionActive || currentUser.packageId !== 'vip') && userListingsCount >= maxListings;

    if (limitExceeded) {
      alert("Kechirasiz, sizning joriy e'lonlar limitingiz tugagan. Iltimos, profilingizda tarifni yuqoriroq darajaga yangilang.");
      triggerOpenPackageShop(currentUser.packageId === 'standard' ? 'premium' : 'vip');
      return;
    }

    // Collect Form Values for selection overlay
    const formData = {
      title: formTitle,
      dealType: formDealType,
      propertyType: formPropertyType,
      regionId: formRegionId,
      districtId: formDistrictId,
      address: formAddress,
      price: formPrice,
      area: formArea,
      rooms: formRooms,
      floor: formFloor,
      maxFloors: formMaxFloors,
      description: formDescription,
      hasGas: formHasGas,
      hasElectricity: formHasElectricity,
      hasWater: formHasWater,
      hasSewage: formHasSewage,
      hasInternet: formHasInternet,
      hasParking: formHasParking,
      hasFurniture: formHasFurniture,
      hasSecurity: formHasSecurity,
      imageUrls: formImageUrls,
      videoUrl: formVideoUrl
    };

    if (onShowPlanSelection) {
      onShowPlanSelection(formData);
    } else {
      // Direct listing submission
      try {
        await onAddListing({
          ...updatedData,
          ownerName: currentUser.fullName || currentUser.username || "Foydalanuvchi",
          ownerPhone: currentUser.phone || currentUser.phoneNumber || "",
          ownerTelegram: currentUser.telegramId ? currentUser.telegramId.toString() : (currentUser.username || ""),
          status: 'pending',
          isPremium: false,
          plan: 'standard',
          userId: currentUser.id,
          googleMapUrl: "https://maps.google.com"
        } as any);
        
        alert("E'loningiz muvaffaqiyatli qabul qilindi!");
        
        // Clear form
        setFormTitle('');
        setFormAddress('');
        setFormPrice('');
        setFormArea('');
        setFormRooms('');
        setFormFloor('');
        setFormMaxFloors('');
        setFormDescription('');
        setFormImageUrls([]);
        setFormVideoUrl('');
        
        if (setActiveTab) {
          setActiveTab('my_listings');
        }
      } catch (err) {
        console.error(err);
        alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }
    }
  };

  const limitExceeded = (!isSubscriptionActive || currentUser.packageId !== 'vip') && userListingsCount >= maxListings;

  if (limitExceeded) {
    return (
      <LimitExceededView 
        currentUser={currentUser}
        isSubscriptionActive={isSubscriptionActive}
        maxListings={maxListings}
        userListingsCount={userListingsCount}
        triggerOpenPackageShop={triggerOpenPackageShop}
      />
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#0082D5] border-b border-[#E2EAF8] pb-2">Yangi e'lon berish</h3>

      {formSubmitted ? (
        <div className="bg-white border border-[#E2EAF8] rounded-2xl p-8 text-center space-y-3 text-emerald-600 shadow-sm">
          <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
          <h4 className="font-bold text-xs">E'lon moderatsiyaga yuborildi!</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            E'loningiz qabul qilindi. Administrator tekshirganidan so'ng tizimda namoyish etiladi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleCreateListingSubmit} className="bg-white border border-[#E2EAF8] rounded-2xl p-4 space-y-3.5 shadow-sm">
          
          {/* Basic Details Inputs */}
          <ListingBasicDetailsForm 
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDealType={formDealType}
            setFormDealType={setFormDealType}
            formPropertyType={formPropertyType}
            setFormPropertyType={setFormPropertyType}
            regions={regions}
            formRegionId={formRegionId}
            setFormRegionId={setFormRegionId}
            districts={districts}
            formDistrictId={formDistrictId}
            setFormDistrictId={setFormDistrictId}
            formAddress={formAddress}
            setFormAddress={setFormAddress}
            formPrice={formPrice}
            setFormPrice={setFormPrice}
            formArea={formArea}
            setFormArea={setFormArea}
            formRooms={formRooms}
            setFormRooms={setFormRooms}
            formFloor={formFloor}
            setFormFloor={setFormFloor}
            formMaxFloors={formMaxFloors}
            setFormMaxFloors={setFormMaxFloors}
          />

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Mulk tavsifi *</label>
            <textarea 
              rows={3}
              placeholder="Mulk haqida to'liq va tushunarli ma'lumot bering..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Interactive Multi-Image File Uploader with Sorting and Deleting */}
          <ListingImageUploader 
            formImageUrls={formImageUrls}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileUpload={handleFileUpload}
            onDeleteImage={handleDeleteImage}
            onMakeCover={handleMakeCover}
            onMoveImage={handleMoveImage}
          />

          {/* Features checklist switches */}
          <ListingFeaturesSelector 
            features={[
              { label: "Tabiiy Gaz", value: formHasGas, onChange: setFormHasGas },
              { label: "Elektr tarmoqlari", value: formHasElectricity, onChange: setFormHasElectricity },
              { label: "Ichimlik Suvi", value: formHasWater, onChange: setFormHasWater },
              { label: "Kanalizatsiya", value: formHasSewage, onChange: setFormHasSewage },
              { label: "Tezkor Internet", value: formHasInternet, onChange: setFormHasInternet },
              { label: "Avtoturargoh", value: formHasParking, onChange: setFormHasParking },
              { label: "Mebel jixozlari", value: formHasFurniture, onChange: setFormHasFurniture },
              { label: "Qo'riqlash tizimi", value: formHasSecurity, onChange: setFormHasSecurity },
            ]}
          />

          {/* Submit button */}
          <button 
            type="submit"
            className="w-full py-2.5 bg-[#0082D5] hover:bg-[#0070bc] rounded-xl text-white text-[11px] font-black transition-all duration-300 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            E'lonni rasman kiritish ➔
          </button>

        </form>
      )}
    </div>
  );
}
