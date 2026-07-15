import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Image as ImageIcon, Sparkles, Building, DollarSign, Lightbulb } from 'lucide-react';

interface StorySlide {
  id: string;
  title: string;
  price?: string;
  imageUrl: string;
  desc?: string;
  listingId?: string;
  ownerPhone?: string;
}

export default function AdminStories() {
  const [customStories, setCustomStories] = useState<Record<string, StorySlide[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<'villas' | 'apartments' | 'cheap' | 'tips'>('villas');
  
  // Form States
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sara_custom_stories');
      if (saved) {
        setCustomStories(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Error loading custom stories", e);
    }
  }, []);

  const saveStories = (updated: Record<string, StorySlide[]>) => {
    setCustomStories(updated);
    localStorage.setItem('sara_custom_stories', JSON.stringify(updated));
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert("Iltimos, sarlavha va rasm URL manzilini to'ldiring!");
      return;
    }

    const newSlide: StorySlide = {
      id: `custom-slide-${Date.now()}`,
      title: title.trim(),
      desc: desc.trim() || undefined,
      imageUrl: imageUrl.trim(),
      price: price.trim() || undefined,
      ownerPhone: ownerPhone.trim() || undefined
    };

    const updated = {
      ...customStories,
      [selectedCategory]: [newSlide, ...(customStories[selectedCategory] || [])]
    };

    saveStories(updated);
    
    // Clear Form
    setTitle('');
    setDesc('');
    setImageUrl('');
    setPrice('');
    setOwnerPhone('');
  };

  const handleDeleteStory = (category: string, id: string) => {
    if (!window.confirm("Haqiqatdan ham ushbu hikoyani o'chirmoqchimisiz?")) return;

    const updated = {
      ...customStories,
      [category]: (customStories[category] || []).filter(slide => slide.id !== id)
    };

    saveStories(updated);
  };

  // Sample image suggestion helpers
  const sampleImages = [
    { name: "Premium Villa", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80" },
    { name: "Luxury Apartment", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
    { name: "Modern Interior", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80" },
    { name: "Cozy Penthouse", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            🎬 Premium Stories Boshqaruvi
          </h3>
          <p className="text-[10px] text-white/50 mt-0.5">
            Mini App bosh sahifasidagi aylanma "Hikoyalar" lentasiga yangi reklama va maslahatlarni joylashtiring.
          </p>
        </div>
        {isSuccess && (
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-lg uppercase animate-pulse">
            O'zgarishlar Saqlandi! ✓
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form to Add Stories */}
        <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 border-b border-white/5 pb-2">
            Yangi Hikoya Qo'shish
          </h4>

          <form onSubmit={handleAddStory} className="space-y-3 text-[11px]">
            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-wider block">Kategoriya</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'villas', name: 'Villalar', icon: Sparkles },
                  { id: 'apartments', name: 'Kvartiralar', icon: Building },
                  { id: 'cheap', name: 'Arzon', icon: DollarSign },
                  { id: 'tips', name: 'Maslahatlar', icon: Lightbulb }
                ].map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-500 text-white shadow' : 'bg-black/30 border-white/5 text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-wider block">Sarlavha *</label>
              <input
                type="text"
                placeholder="Masalan: Shayxontohurda yangi daxshatli penthouse"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-wider block">Batafsil Tavsif (Subtitr)</label>
              <textarea
                rows={3}
                placeholder="Ushbu uy haqida qisqacha ma'lumot (2 qator)..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Price & Owner Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-white/40 uppercase font-black tracking-wider block">Narxi (Masalan: $120,000)</label>
                <input
                  type="text"
                  placeholder="$120,000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-white/40 uppercase font-black tracking-wider block">Aloqa Telefoni</label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <label className="text-[9px] text-white/40 uppercase font-black tracking-wider block">Rasm URL Manzili *</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            {/* Image suggestion chips */}
            <div className="space-y-1">
              <span className="text-[8px] text-white/30 uppercase font-extrabold tracking-widest block">Tayyor rasmlardan foydalanish:</span>
              <div className="flex flex-wrap gap-1">
                {sampleImages.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg px-2 py-1 text-[8px] font-black text-white/70 transition cursor-pointer"
                  >
                    📸 {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Image preview box */}
            {imageUrl.trim() && (
              <div className="aspect-video w-full rounded-xl border border-white/10 overflow-hidden relative bg-black/50">
                <img src={imageUrl} alt="Story Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/70 text-[7px] text-white/80 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Rasm Prevyusi</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Hikoyani Chop Etish ➔
            </button>
          </form>
        </div>

        {/* Right Column: List of Custom Stories */}
        <div className="lg:col-span-7 bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">
              Chop Etilgan Hikoyalar
            </h4>
            <span className="text-[10px] font-bold text-white/40 uppercase">
              Hozirda: {(customStories[selectedCategory] || []).length} ta
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {!(customStories[selectedCategory] || []).length ? (
              <div className="bg-black/20 border border-dashed border-white/5 rounded-2xl p-10 text-center text-white/30 space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-white/20" />
                <h5 className="font-bold text-xs">Ushbu turkumda hikoyalar yo'q</h5>
                <p className="text-[9px] max-w-xs mx-auto">
                  Chap tomondagi formadan foydalanib, tanlangan turkum bo'yicha administrator nomidan yangi hikoya e'lon qiling.
                </p>
              </div>
            ) : (
              (customStories[selectedCategory] || []).map((slide) => (
                <div key={slide.id} className="bg-black/30 border border-white/5 hover:border-white/10 rounded-2xl p-3 flex gap-4 items-center transition">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[7px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Custom</span>
                      {slide.price && (
                        <span className="text-[8px] font-black text-amber-400 font-mono">{slide.price}</span>
                      )}
                    </div>
                    <h5 className="text-[11px] font-black text-white truncate leading-tight">{slide.title}</h5>
                    <p className="text-[9px] text-white/60 line-clamp-1 leading-normal font-semibold">
                      {slide.desc || "Qisqacha tavsif yozilmagan."}
                    </p>
                    {slide.ownerPhone && (
                      <span className="text-[8px] font-bold text-white/40 block font-mono">📱 {slide.ownerPhone}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteStory(selectedCategory, slide.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl cursor-pointer transition shrink-0"
                    title="Hikoyani o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
