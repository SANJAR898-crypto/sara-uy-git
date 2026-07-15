import React, { useState, useEffect } from 'react';
import { Region, District, Listing, PropertyType, DealType } from '../../types';
import Filters from './Filters';
import SearchResults from './SearchResults';
import { Sparkles } from 'lucide-react';

interface SearchProps {
  // Lists
  regions: Region[];
  districts: District[];
  listings: Listing[];
  favorites: string[];
  
  // Handlers
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;

  // Filter States
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedRegion?: string;
  setSelectedRegion?: (r: string) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (d: string) => void;
  selectedPropertyType?: 'all' | PropertyType;
  setSelectedPropertyType?: (type: 'all' | PropertyType) => void;
  selectedDealType?: 'all' | DealType;
  setSelectedDealType?: (deal: 'all' | DealType) => void;
  priceMax?: number;
  setPriceMax?: (price: number) => void;
  roomsCount?: number;
  setRoomsCount?: (rooms: number) => void;
  minArea?: number;
  setMinArea?: (area: number) => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;

  // Boolean features
  filterGas?: boolean;
  setFilterGas?: (val: boolean) => void;
  filterWater?: boolean;
  setFilterWater?: (val: boolean) => void;
  filterInternet?: boolean;
  setFilterInternet?: (val: boolean) => void;
  filterParking?: boolean;
  setFilterParking?: (val: boolean) => void;
  filterFurniture?: boolean;
  setFilterFurniture?: (val: boolean) => void;

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
}

export default function Search({
  regions,
  districts,
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  searchQuery,
  setSearchQuery,
  selectedRegion,
  setSelectedRegion,
  selectedDistrict,
  setSelectedDistrict,
  selectedPropertyType,
  setSelectedPropertyType,
  selectedDealType,
  setSelectedDealType,
  priceMax,
  setPriceMax,
  roomsCount,
  setRoomsCount,
  minArea,
  setMinArea,
  sortBy,
  setSortBy,
  filterGas,
  setFilterGas,
  filterWater,
  setFilterWater,
  filterInternet,
  setFilterInternet,
  filterParking,
  setFilterParking,
  filterFurniture,
  setFilterFurniture,
  initialFilters,
  onClearInitialFilters
}: SearchProps) {

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localSelectedRegion, setLocalSelectedRegion] = useState(initialFilters?.regionId || 'all');
  const [localSelectedDistrict, setLocalSelectedDistrict] = useState(initialFilters?.districtId || 'all');
  const [localSelectedPropertyType, setLocalSelectedPropertyType] = useState<'all' | PropertyType>(initialFilters?.propertyType || 'all');
  const [localSelectedDealType, setLocalSelectedDealType] = useState<'all' | DealType>(initialFilters?.dealType || 'all');
  const [localPriceMax, setLocalPriceMax] = useState<number>(initialFilters?.price || 1000000);
  const [localRoomsCount, setLocalRoomsCount] = useState<number>(initialFilters?.rooms || 0);
  const [localMinArea, setLocalMinArea] = useState<number>(initialFilters?.area || 0);
  const [localSortBy, setLocalSortBy] = useState('newest');
  const [localFilterGas, setLocalFilterGas] = useState(initialFilters?.additionalFilters?.includes('gas') || false);
  const [localFilterWater, setLocalFilterWater] = useState(initialFilters?.additionalFilters?.includes('water') || false);
  const [localFilterInternet, setLocalFilterInternet] = useState(initialFilters?.additionalFilters?.includes('internet') || false);
  const [localFilterParking, setLocalFilterParking] = useState(initialFilters?.additionalFilters?.includes('parking') || false);
  const [localFilterFurniture, setLocalFilterFurniture] = useState(initialFilters?.additionalFilters?.includes('furniture') || false);

  // AI Search states
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.regionId) setLocalSelectedRegion(initialFilters.regionId);
      if (initialFilters.districtId) setLocalSelectedDistrict(initialFilters.districtId);
      if (initialFilters.propertyType) setLocalSelectedPropertyType(initialFilters.propertyType);
      if (initialFilters.dealType) setLocalSelectedDealType(initialFilters.dealType);
      if (initialFilters.price) setLocalPriceMax(initialFilters.price);
      if (initialFilters.rooms) setLocalRoomsCount(initialFilters.rooms);
      if (initialFilters.area) setLocalMinArea(initialFilters.area);
      setLocalFilterGas(initialFilters.additionalFilters?.includes('gas') || false);
      setLocalFilterWater(initialFilters.additionalFilters?.includes('water') || false);
      setLocalFilterInternet(initialFilters.additionalFilters?.includes('internet') || false);
      setLocalFilterParking(initialFilters.additionalFilters?.includes('parking') || false);
      setLocalFilterFurniture(initialFilters.additionalFilters?.includes('furniture') || false);
    }
  }, [initialFilters]);

  const query = searchQuery !== undefined ? searchQuery : localSearchQuery;
  const setQuery = setSearchQuery !== undefined ? setSearchQuery : setLocalSearchQuery;

  const region = selectedRegion !== undefined ? selectedRegion : localSelectedRegion;
  const setRegion = setSelectedRegion !== undefined ? setSelectedRegion : setLocalSelectedRegion;

  const district = selectedDistrict !== undefined ? selectedDistrict : localSelectedDistrict;
  const setDistrict = setSelectedDistrict !== undefined ? setSelectedDistrict : setLocalSelectedDistrict;

  const propType = selectedPropertyType !== undefined ? selectedPropertyType : localSelectedPropertyType;
  const setPropType = setSelectedPropertyType !== undefined ? setSelectedPropertyType : setLocalSelectedPropertyType;

  const dealType = selectedDealType !== undefined ? selectedDealType : localSelectedDealType;
  const setDealTypeVal = setSelectedDealType !== undefined ? setSelectedDealType : setLocalSelectedDealType;

  const maxPrice = priceMax !== undefined ? priceMax : localPriceMax;
  const setMaxPrice = setPriceMax !== undefined ? setPriceMax : setLocalPriceMax;

  const rooms = roomsCount !== undefined ? roomsCount : localRoomsCount;
  const setRooms = setRoomsCount !== undefined ? setRoomsCount : setLocalRoomsCount;

  const minAreaVal = minArea !== undefined ? minArea : localMinArea;
  const setMinAreaVal = setMinArea !== undefined ? setMinArea : setLocalMinArea;

  const sort = sortBy !== undefined ? sortBy : localSortBy;
  const setSort = setSortBy !== undefined ? setSortBy : setLocalSortBy;

  const fGas = filterGas !== undefined ? filterGas : localFilterGas;
  const setFGas = setFilterGas !== undefined ? setFilterGas : setLocalFilterGas;

  const fWater = filterWater !== undefined ? filterWater : localFilterWater;
  const setFWater = setFilterWater !== undefined ? setFilterWater : setLocalFilterWater;

  const fInternet = filterInternet !== undefined ? filterInternet : localFilterInternet;
  const setFInternet = setFilterInternet !== undefined ? setFilterInternet : setLocalFilterInternet;

  const fParking = filterParking !== undefined ? filterParking : localFilterParking;
  const setFParking = setFilterParking !== undefined ? setFilterParking : setLocalFilterParking;

  const fFurniture = filterFurniture !== undefined ? filterFurniture : localFilterFurniture;
  const setFFurniture = setFilterFurniture !== undefined ? setFilterFurniture : setLocalFilterFurniture;

  // AI search logic handler
  const handleAiSearch = async (textToSearch: string) => {
    if (!textToSearch.trim()) return;
    setIsAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSearch })
      });
      const data = await response.json();
      if (data.success && data.filters) {
        const f = data.filters;
        
        // Magically update UI filters with AI-parsed constraints
        if (f.rooms !== undefined) setRooms(f.rooms);
        if (f.propertyType) setPropType(f.propertyType);
        if (f.dealType) {
          if (f.dealType === 'sale') setDealTypeVal('sale');
          else if (f.dealType.includes('rent')) setDealTypeVal('rent');
        }
        if (f.regionId) setRegion(f.regionId);
        if (f.districtId) setDistrict(f.districtId);
        if (f.priceMax) setMaxPrice(f.priceMax);
        if (f.hasGas !== undefined) setFGas(f.hasGas);
        if (f.hasFurniture !== undefined) setFFurniture(f.hasFurniture);
        
        setQuery(''); // clear text search keyword to avoid overlap
      } else {
        setAiError(data.error || "Tahlil qilishda xatolik yuz berdi");
      }
    } catch (err: any) {
      setAiError(err.message || "Serverga ulanishda xatolik");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Only approved listings are shown in general searches
  const approvedListings = listings.filter(l => l.status === 'approved');

  // Sorted list prioritizing VIP > Premium > Standard
  const sortedApprovedListings = [...approvedListings].sort((a, b) => {
    const getWeight = (plan?: string) => {
      if (plan === 'vip') return 3;
      if (plan === 'premium') return 2;
      return 1;
    };
    return getWeight(b.plan) - getWeight(a.plan);
  });

  // Filter Logic
  const filteredListings = sortedApprovedListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(query.toLowerCase()) || 
                          listing.address.toLowerCase().includes(query.toLowerCase());
    
    const matchesDealType = dealType === 'all' || listing.dealType === dealType;
    const matchesPropType = propType === 'all' || listing.propertyType === propType;
    const matchesRegion = region === 'all' || listing.regionId === region;
    const matchesDistrict = district === 'all' || listing.districtId === district;
    
    const matchesPrice = listing.price <= maxPrice;
    const matchesArea = minAreaVal === 0 || listing.area >= minAreaVal;
    const matchesRooms = rooms === 0 || listing.rooms === rooms || (rooms === 4 && listing.rooms >= 4);

    const matchesGas = !fGas || listing.hasGas;
    const matchesWater = !fWater || listing.hasWater;
    const matchesInternet = !fInternet || listing.hasInternet;
    const matchesParking = !fParking || listing.hasParking;
    const matchesFurniture = !fFurniture || listing.hasFurniture;

    return matchesSearch && matchesDealType && matchesPropType && matchesRegion && 
           matchesDistrict && matchesPrice && matchesArea && matchesRooms &&
           matchesGas && matchesWater && matchesInternet && matchesParking && matchesFurniture;
  });

  // Sort Logic
  const finalSortedListings = [...filteredListings].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'popular') return b.viewsCount - a.viewsCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // default newest
  });

  return (
    <div className="space-y-4 font-sans">
      
      {/* Premium AI Search Assistant Panel */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-4 space-y-3 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles className="w-16 h-16 text-indigo-600" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 leading-none">Aqlli AI Mulk Qidiruvi</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Tabiiy tilda yozing, AI filtrlarni o'zi to'g'rilaydi!</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Masalan: Samarqandda hovli hovli yoki Toshkentda 3 xonali uy 80000$ gacha..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAiSearch(aiInput);
            }}
            disabled={isAiLoading}
            className="flex-1 bg-white border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 font-medium disabled:opacity-75"
          />
          <button
            onClick={() => handleAiSearch(aiInput)}
            disabled={isAiLoading || !aiInput.trim()}
            className="px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 active:scale-95 cursor-pointer"
          >
            {isAiLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tahlil</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <p className="text-[10px] text-red-500 font-semibold px-0.5">{aiError}</p>
        )}

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">Namuna so'rovlar:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Toshkentda 3 xonali dom 80000$ gacha",
              "Samarqandda hovli sotiladi",
              "Yunusobodda mebelli kvartira ijara"
            ].map((suggest, i) => (
              <button
                key={i}
                disabled={isAiLoading}
                onClick={() => {
                  setAiInput(suggest);
                  handleAiSearch(suggest);
                }}
                className="py-1 px-2.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-indigo-600 hover:bg-slate-50/80 active:scale-95 transition-all text-left shadow-[0_2px_4px_rgba(0,0,0,0.01)] cursor-pointer"
              >
                💡 {suggest}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Filters
        searchQuery={query}
        setSearchQuery={setQuery}
        selectedRegion={region}
        setSelectedRegion={setRegion}
        selectedDistrict={district}
        setSelectedDistrict={setDistrict}
        selectedPropertyType={propType}
        setSelectedPropertyType={setPropType}
        selectedDealType={dealType}
        setSelectedDealType={setDealTypeVal}
        priceMax={maxPrice}
        setPriceMax={setMaxPrice}
        roomsCount={rooms}
        setRoomsCount={setRooms}
        minArea={minAreaVal}
        setMinArea={setMinAreaVal}
        sortBy={sort}
        setSortBy={setSort}
        regions={regions}
        districts={districts}
      />

      {/* Additional Boolean Feature Toggles */}
      <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.01)] grid grid-cols-3 gap-2">
        {[
          { label: "⚡ Gaz", value: fGas, setter: setFGas },
          { label: "💧 Suv", value: fWater, setter: setFWater },
          { label: "🌐 Internet", value: fInternet, setter: setFInternet },
          { label: "🚗 Parking", value: fParking, setter: setFParking },
          { label: "🛋 Mebel", value: fFurniture, setter: setFFurniture }
        ].map((feat, i) => (
          <button
            key={i}
            onClick={() => feat.setter(!feat.value)}
            className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer ${
              feat.value 
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                : 'bg-slate-50 border-slate-100/70 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {feat.label}
          </button>
        ))}
      </div>

      {/* Results Title Count */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qidiruv natijalari</span>
        <span className="text-[10px] text-slate-900 font-bold">{finalSortedListings.length} ta uy topildi</span>
      </div>

      <SearchResults
        listings={finalSortedListings}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onSelectListing={onSelectListing}
        districts={districts}
        regions={regions}
      />
    </div>
  );
}
