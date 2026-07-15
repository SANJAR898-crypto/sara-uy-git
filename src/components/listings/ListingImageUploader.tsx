import React from 'react';
import { PlusCircle, X } from 'lucide-react';

interface ListingImageUploaderProps {
  formImageUrls: string[];
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: (index: number) => void;
  onMakeCover: (index: number) => void;
  onMoveImage: (index: number, direction: 'left' | 'right') => void;
}

export default function ListingImageUploader({
  formImageUrls,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileUpload,
  onDeleteImage,
  onMakeCover,
  onMoveImage
}: ListingImageUploaderProps) {
  return (
    <div className="space-y-2 font-sans">
      <div className="flex justify-between items-center">
        <label className="text-[8px] text-slate-400 uppercase tracking-widest font-extrabold block">Mulk rasmlari * (Maksimal 20 rasm)</label>
        <span className="text-[9px] text-[#0082D5] font-extrabold">{formImageUrls.length} / 20</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {formImageUrls.length < 20 && (
          <label 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition duration-200 ${isDragging ? 'border-[#0082D5] bg-blue-50/50' : 'bg-slate-50 border-[#E2EAF8] hover:border-[#0082D5] hover:bg-slate-100/50'}`}
          >
            <PlusCircle className={`w-5 h-5 ${isDragging ? 'text-[#0082D5]' : 'text-slate-400'}`} />
            <span className="text-[7px] text-slate-500 font-extrabold mt-1 text-center">Fayl yuklash</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={onFileUpload} 
              className="hidden" 
            />
          </label>
        )}

        {/* Previews with drag controls simulated as click controls */}
        {formImageUrls.map((url, index) => (
          <div key={index} className="aspect-square bg-slate-100 rounded-xl relative group overflow-hidden border border-[#E2EAF8]">
            <img src={url} className="w-full h-full object-cover" />
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-[#0082D5] text-white text-[6px] font-black px-1 py-0.5 rounded uppercase tracking-wider shadow">Asosiy</span>
            )}
            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
              <button
                type="button"
                onClick={() => onDeleteImage(index)}
                className="self-end bg-red-600 hover:bg-red-700 text-white p-0.5 rounded-lg cursor-pointer shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex justify-between items-center gap-1 mt-auto">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => onMakeCover(index)}
                    className="bg-[#0082D5] hover:bg-blue-600 text-white text-[6px] font-black px-1.5 py-0.5 rounded uppercase cursor-pointer shadow"
                  >
                    Asosiy
                  </button>
                )}
                <div className="flex gap-0.5 ml-auto">
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => onMoveImage(index, 'left')} 
                      className="bg-slate-800/80 hover:bg-slate-700 text-white w-4 h-4 flex items-center justify-center rounded text-[9px] font-bold cursor-pointer"
                    >
                      ‹
                    </button>
                  )}
                  {index < formImageUrls.length - 1 && (
                    <button 
                      type="button" 
                      onClick={() => onMoveImage(index, 'right')} 
                      className="bg-slate-800/80 hover:bg-slate-700 text-white w-4 h-4 flex items-center justify-center rounded text-[9px] font-bold cursor-pointer"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formImageUrls.length === 0 && (
        <p className="text-[9px] text-amber-500 font-extrabold">E'lon berish uchun kamida bitta rasm yuklashingiz shart.</p>
      )}
    </div>
  );
}
