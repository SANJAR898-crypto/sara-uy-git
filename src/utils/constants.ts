import { Region, District } from '../types';

export const DEFAULT_STORIES = {
  villas: [
    {
      id: 'sv-1',
      title: "Ko'kaldosh sohilidagi dabdabali shinam villa",
      price: "$450,000",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      desc: "8 xona, 12 sotix, qishki va yozgi basseyn, sauna, lof uslubidagi ta'mir. Juda nufuzli hududda joylagan.",
      ownerPhone: "+998 90 999 11 22"
    },
    {
      id: 'sv-2',
      title: "Qibrayda 8 sotixli yevro-villa yangi uy",
      price: "$280,000",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      desc: "Yevropacha dizayn, eng sifatli qurilish materiallari, mebellar va texnikalar to'liq jihozlangan.",
      ownerPhone: "+998 91 777 88 99"
    }
  ],
  apartments: [
    {
      id: 'sa-1',
      title: "Tashkent City - Gardens Residence penthouse",
      price: "$185,000",
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      desc: "Tashkent City qoq markazida, 4 xonali premium xonadon. Panoramic manzara, shaxsiy terassa, yuqori xavfsizlik.",
      ownerPhone: "+998 90 321 00 99"
    }
  ]
};

export const DEFAULT_PLANS = [
  { id: 'vip', name: 'VIP', price: 99, durationDays: 30, badge: '🥇 VIP' },
  { id: 'premium', name: 'Premium', price: 49, durationDays: 30, badge: '🥈 Premium' },
  { id: 'standard', name: 'Standard', price: 0, durationDays: 30, badge: '🥉 Standard' }
];
