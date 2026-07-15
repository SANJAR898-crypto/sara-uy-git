import React from 'react';

interface FeatureCheckbox {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

interface ListingFeaturesSelectorProps {
  features: FeatureCheckbox[];
}

export default function ListingFeaturesSelector({ features }: ListingFeaturesSelectorProps) {
  return (
    <div className="space-y-2 pt-2 border-t border-[#E2EAF8] font-sans">
      <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Mulk sharoitlari & kommunal tarmoqlari</label>
      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-bold">
        {features.map((feat, i) => (
          <label key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg cursor-pointer hover:bg-slate-100 transition">
            <input 
              type="checkbox" 
              checked={feat.value} 
              onChange={(e) => feat.onChange(e.target.checked)} 
              className="rounded text-[#0082D5] focus:ring-[#0082D5]" 
            />
            <span>{feat.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
