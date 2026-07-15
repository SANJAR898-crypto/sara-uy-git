import React, { useState } from 'react';
import { Map, ListPlus } from 'lucide-react';
import { Region, District } from '../../types';

interface AdminConfigProps {
  regions: Region[];
  districts: District[];
  onAddRegion: (name: string) => void;
  onAddDistrict: (regionId: string, name: string) => void;
}

export default function AdminConfig({
  regions,
  districts,
  onAddRegion,
  onAddDistrict
}: AdminConfigProps) {
  const [newRegName, setNewRegName] = useState('');
  const [newDistName, setNewDistName] = useState('');
  const [newDistRegId, setNewDistRegId] = useState(regions[0]?.id || '');

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegName.trim()) return;
    onAddRegion(newRegName.trim());
    setNewRegName('');
  };

  const handleCreateDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistName.trim() || !newDistRegId) return;
    onAddDistrict(newDistRegId, newDistName.trim());
    setNewDistName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Tizim ma'lumotnomalarini boshqarish</h3>
        <span className="text-[10px] text-white/50">Viloyat va tumanlar ro'yxati</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Region form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-white/80 flex items-center gap-1.5">
            <Map className="w-4 h-4 text-blue-500" /> Viloyat / Shahar qo'shish
          </h4>

          <form onSubmit={handleCreateRegion} className="flex gap-2">
            <input 
              type="text" 
              required
              placeholder="Masalan: Buxoro viloyati"
              value={newRegName}
              onChange={(e) => setNewRegName(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer">
              Qo'shish
            </button>
          </form>

          <div className="space-y-2 pt-2">
            <span className="text-[9px] text-white/40 uppercase font-bold block">Tizimdagi viloyatlar:</span>
            <div className="flex flex-wrap gap-1.5">
              {regions.map(r => (
                <span key={r.id} className="bg-slate-950 px-2 py-1 rounded text-[10px] font-bold border border-white/5">
                  📍 {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Add District form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-extrabold uppercase text-white/80 flex items-center gap-1.5">
            <ListPlus className="w-4 h-4 text-blue-500" /> Tuman qo'shish
          </h4>

          <form onSubmit={handleCreateDistrict} className="space-y-3.5">
            <div>
              <label className="text-[9px] text-white/40 uppercase block mb-1 font-bold">Tegishli viloyatni tanlang</label>
              <select 
                value={newDistRegId}
                onChange={(e) => setNewDistRegId(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-1.5 px-2 text-xs text-white"
              >
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                required
                placeholder="Masalan: Kogon tumani"
                value={newDistName}
                onChange={(e) => setNewDistName(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/5 rounded-xl py-2 px-3 text-xs focus:outline-none text-white"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                Qo'shish
              </button>
            </div>
          </form>

          <div className="space-y-2 pt-1">
            <span className="text-[9px] text-white/40 uppercase font-bold block">Tizimdagi tumanlar:</span>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
              {districts.map(d => (
                <span key={d.id} className="bg-slate-950 px-2 py-1 rounded text-[9px] font-medium text-white/80 border border-white/5">
                  🌳 {d.name} <span className="text-[8px] text-white/30">({regions.find(r => r.id === d.regionId)?.name})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
