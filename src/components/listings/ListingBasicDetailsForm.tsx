import React from 'react';
import { Region, District, DealType, PropertyType } from '../../types';

interface ListingBasicDetailsFormProps {
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDealType: DealType;
  setFormDealType: (val: DealType) => void;
  formPropertyType: PropertyType;
  setFormPropertyType: (val: PropertyType) => void;
  regions: Region[];
  formRegionId: string;
  setFormRegionId: (val: string) => void;
  districts: District[];
  formDistrictId: string;
  setFormDistrictId: (val: string) => void;
  formAddress: string;
  setFormAddress: (val: string) => void;
  formPrice: string;
  setFormPrice: (val: string) => void;
  formArea: string;
  setFormArea: (val: string) => void;
  formRooms: string;
  setFormRooms: (val: string) => void;
  formFloor: string;
  setFormFloor: (val: string) => void;
  formMaxFloors: string;
  setFormMaxFloors: (val: string) => void;
}

export default function ListingBasicDetailsForm({
  formTitle,
  setFormTitle,
  formDealType,
  setFormDealType,
  formPropertyType,
  setFormPropertyType,
  regions,
  formRegionId,
  setFormRegionId,
  districts,
  formDistrictId,
  setFormDistrictId,
  formAddress,
  setFormAddress,
  formPrice,
  setFormPrice,
  formArea,
  setFormArea,
  formRooms,
  setFormRooms,
  formFloor,
  setFormFloor,
  formMaxFloors,
  setFormMaxFloors
}: ListingBasicDetailsFormProps) {
  return (
    <div className="space-y-3.5 font-sans">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">E'lon sarlavhasi *</label>
        <input 
          type="text" 
          placeholder="Masalan: Oybek metrosida 3 xonali premium kvartira"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Deal & Property Types */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Kelishuv turi *</label>
          <select 
            value={formDealType}
            onChange={(e) => setFormDealType(e.target.value as DealType)}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-bold focus:outline-none"
          >
            <option value="sale">Sotish (Sale)</option>
            <option value="rent">Ijaraga berish (Rent)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Mulk turi *</label>
          <select 
            value={formPropertyType}
            onChange={(e) => setFormPropertyType(e.target.value as PropertyType)}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-bold focus:outline-none"
          >
            <option value="apartment">Apartment (Kvartira)</option>
            <option value="house">House (Hovli / Evrodom)</option>
            <option value="new_building">Yangi bino (Novostroyka)</option>
            <option value="land">Yer uchastkasi</option>
            <option value="commercial">Commercial (Ofis/Do'kon)</option>
          </select>
        </div>
      </div>

      {/* Region & District Selection */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Viloyat / Shahar *</label>
          <select 
            value={formRegionId}
            onChange={(e) => {
              const rId = e.target.value;
              setFormRegionId(rId);
              const matchingDistricts = districts.filter(d => d.regionId === rId);
              if (matchingDistricts.length > 0) {
                setFormDistrictId(matchingDistricts[0].id);
              }
            }}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-bold focus:outline-none"
            required
          >
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Tuman *</label>
          <select 
            value={formDistrictId}
            onChange={(e) => setFormDistrictId(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl px-2.5 py-2 text-[10px] text-slate-700 font-bold focus:outline-none"
            required
          >
            {districts.filter(d => d.regionId === formRegionId).map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Aniq manzili *</label>
        <input 
          type="text" 
          placeholder="Masalan: Oybek ko'chasi, 12-uy, 44-xonadon"
          value={formAddress}
          onChange={(e) => setFormAddress(e.target.value)}
          className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      {/* Price, Rooms, Area */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Narxi (USD) *</label>
          <input 
            type="number" 
            placeholder="85000"
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Maydoni (m²) *</label>
          <input 
            type="number" 
            placeholder="72"
            value={formArea}
            onChange={(e) => setFormArea(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Xonalar *</label>
          <input 
            type="number" 
            placeholder="3"
            value={formRooms}
            onChange={(e) => setFormRooms(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            required
          />
        </div>
      </div>

      {/* Floor & Max Floors (conditionally for apartments) */}
      {formPropertyType === 'apartment' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Joylashgan qavati</label>
            <input 
              type="number" 
              placeholder="5"
              value={formFloor}
              onChange={(e) => setFormFloor(e.target.value)}
              className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Binoning umumiy qavati</label>
            <input 
              type="number" 
              placeholder="9"
              value={formMaxFloors}
              onChange={(e) => setFormMaxFloors(e.target.value)}
              className="w-full bg-slate-50 border border-[#E2EAF8] rounded-xl py-2 px-3 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}
