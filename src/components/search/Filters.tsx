import React from 'react';
import { Search } from 'lucide-react';
import { Region, District, PropertyType, DealType } from '../../types';

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedPropertyType: 'all' | PropertyType;
  setSelectedPropertyType: (type: 'all' | PropertyType) => void;
  selectedDealType: 'all' | DealType;
  setSelectedDealType: (deal: 'all' | DealType) => void;
  priceMax: number;
  setPriceMax: (price: number) => void;
  roomsCount: number;
  setRoomsCount: (rooms: number) => void;
  minArea: number;
  setMinArea: (area: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  regions: Region[];
  districts: District[];
}

export default function Filters({
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
  regions,
  districts
}: FiltersProps) {
  return (
    <div className="bg-white border border-slate-200/50 rounded-2xl p-4 space-y-4 shadow-sm font-sans">
      <div className="flex gap-2">
        {/* Search Text input */}
        <div className="flex-1 bg-slate-50/80 border border-slate-100 rounded-xl px-3 py-2.5 flex items-center gap-2 focus-within:border-slate-300 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Hudud, tuman, manzil qidirish..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-800 text-xs w-full focus:outline-none placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Advanced filter sections */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Region */}
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Viloyat / Shahar</label>
          <select 
            value={selectedRegion}
            onChange={(e) => { setSelectedRegion(e.target.value); setSelectedDistrict('all'); }}
            className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-medium focus:outline-none focus:border-slate-300 transition-all"
          >
            <option value="all">Barchasi (All)</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Tuman / Hudud</label>
          <select 
            value={selectedDistrict}
            disabled={selectedRegion === 'all'}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-medium focus:outline-none focus:border-slate-300 transition-all disabled:opacity-50"
          >
            <option value="all">Barchasi (All)</option>
            {districts.filter(d => d.regionId === selectedRegion).map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Mulk turi</label>
          <select 
            value={selectedPropertyType}
            onChange={(e) => setSelectedPropertyType(e.target.value as any)}
            className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-medium focus:outline-none focus:border-slate-300 transition-all"
          >
            <option value="all">Barchasi (All)</option>
            <option value="apartment">Apartment (Kvartira)</option>
            <option value="house">House (Hovli / Evrodom)</option>
            <option value="new_building">Novostroyka (Yangi uylar)</option>
            <option value="land">Land (Er uchastkalari)</option>
            <option value="commercial">Commercial (Ofis/Biznes)</option>
          </select>
        </div>

        {/* Deal Type */}
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Kelishuv turi</label>
          <select 
            value={selectedDealType}
            onChange={(e) => setSelectedDealType(e.target.value as any)}
            className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-medium focus:outline-none focus:border-slate-300 transition-all"
          >
            <option value="all">Barchasi (All)</option>
            <option value="sale">Sotuvchi (Sale)</option>
            <option value="rent">Ijara (Rent)</option>
          </select>
        </div>

      </div>

      {/* Price Max slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[9px] font-bold">
          <span className="text-slate-400 uppercase tracking-widest">Maksimal Narx (USD)</span>
          <span className="text-slate-900 font-bold font-mono">${priceMax.toLocaleString()}</span>
        </div>
        <input 
          type="range" 
          min={100}
          max={350000}
          step={500}
          value={priceMax}
          onChange={(e) => setPriceMax(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-950"
        />
      </div>

      {/* Rooms and Area selector */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Xonalar soni</label>
          <select 
            value={roomsCount}
            onChange={(e) => setRoomsCount(parseInt(e.target.value))}
            className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-medium focus:outline-none focus:border-slate-300 transition-all"
          >
            <option value="0">Farqi yo'q</option>
            <option value="1">1 xona</option>
            <option value="2">2 xona</option>
            <option value="3">3 xona</option>
            <option value="4">4+ xonali</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-bold block">Minimal maydon (m²)</label>
          <select 
            value={minArea}
            onChange={(e) => setMinArea(parseInt(e.target.value))}
            className="w-full bg-slate-50/80 border border-slate-100 rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-medium focus:outline-none focus:border-slate-300 transition-all"
          >
            <option value="0">Farqi yo'q</option>
            <option value="30">30 m² dan yuqori</option>
            <option value="60">60 m² dan yuqori</option>
            <option value="100">100 m² dan yuqori</option>
            <option value="200">200 m² dan yuqori</option>
          </select>
        </div>
      </div>

      {/* Sort by option */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold shrink-0">Saralash tartibi</span>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent border border-slate-100 rounded-lg px-2 py-1 text-[10px] text-slate-600 font-medium focus:outline-none cursor-pointer"
        >
          <option value="newest">Eng yangi e'lonlar</option>
          <option value="popular">Eng ko'p ko'rilganlar</option>
          <option value="price_asc">Narxi (Arzonidan boshlab)</option>
          <option value="price_desc">Narxi (Qimmatidan boshlab)</option>
        </select>
      </div>

    </div>
  );
}
