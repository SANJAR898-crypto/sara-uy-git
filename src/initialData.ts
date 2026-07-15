/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Listing, Region, District, Review } from './types';

export const INITIAL_REGIONS: Region[] = [
  { id: 'tashkent-city', name: "Toshkent shahri" },
  { id: 'tashkent-region', name: "Toshkent viloyati" },
  { id: 'samarkand-region', name: "Samarqand viloyati" },
];

export const INITIAL_DISTRICTS: District[] = [
  // Tashkent City districts
  { id: 'mirobod', regionId: 'tashkent-city', name: "Mirobod tumani" },
  { id: 'yunusobod', regionId: 'tashkent-city', name: "Yunusobod tumani" },
  { id: 'chilonzor', regionId: 'tashkent-city', name: "Chilonzor tumani" },
  
  // Tashkent Region districts
  { id: 'bostonliq', regionId: 'tashkent-region', name: "Bo'stonliq tumani" },
  { id: 'zangiota', regionId: 'tashkent-region', name: "Zangiota tumani" },
  
  // Samarkand districts
  { id: 'samarkand-city', regionId: 'samarkand-region', name: "Samarqand shahri" },
];

export const INITIAL_HOUSES: Listing[] = [
  {
    id: 'listing-1',
    ownerName: 'Rustam Karimov',
    ownerPhone: '+998 90 999 11 22',
    ownerTelegram: '@rustam_realtor',
    ownerWhatsapp: '+998909991122',
    title: 'Mirobod tumani, Oybek metrosi yaqinida 3 xonali premium kvartira',
    dealType: 'sale',
    propertyType: 'apartment',
    regionId: 'tashkent-city',
    districtId: 'mirobod',
    address: 'Oybek ko\'chasi, 42-uy',
    googleMapUrl: 'https://maps.google.com/?q=41.2965,69.2781',
    price: 135000,
    area: 92,
    rooms: 3,
    floor: 6,
    maxFloors: 9,
    description: 'Oybek metro bekatiga 5 daqiqalik masofada joylashgan premium kvartira sotiladi. Uy butunlay yangi ta\'mirlangan, yevropacha dizayn va sifatli qurilish materiallaridan foydalanilgan. Mebel va maishiy texnikalar to\'liq qoladi. Atrofda maktablar, bog\'chalar va do\'konlar juda yaqin.',
    isPremium: true,
    viewsCount: 1420,
    reportsCount: 0,
    hasGas: true,
    hasElectricity: true,
    hasWater: true,
    hasSewage: true,
    hasInternet: true,
    hasParking: true,
    hasFurniture: true,
    hasSecurity: true,
    imageUrls: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'approved',
    createdAt: '2026-06-25T12:00:00Z',
    rating: 4.9
  },
  {
    id: 'listing-2',
    ownerName: 'Aziza Aliyeva',
    ownerPhone: '+998 93 330 45 45',
    ownerTelegram: '@aziza_realty',
    ownerWhatsapp: '+998933304545',
    title: 'Yunusobodda 6 sotixli 5 xonali zamonaviy hovli / evrodom',
    dealType: 'rent',
    propertyType: 'house',
    regionId: 'tashkent-city',
    districtId: 'yunusobod',
    address: 'Yunusobod 4-kvartal, Bog\'ishamol ko\'chasi',
    googleMapUrl: 'https://maps.google.com/?q=41.3621,69.2905',
    price: 2200, // Monthly rental
    area: 320,
    rooms: 5,
    floor: 2,
    maxFloors: 2,
    description: 'Yunusobod tumani sokin hududida yangi qurilgan hashamatli evrohovli ijaraga beriladi. 5 ta keng xona, 3 ta sanuzel, keng oshxona va yozgi oshxonasi bor. Hovlida yashil zona, manzarali daraxtlar va avtomobillar uchun keng turargoh mavjud. Uzoq muddatga oila yoki chet ellik mehmonlar uchun ijaraga beriladi.',
    isPremium: true,
    viewsCount: 890,
    reportsCount: 0,
    hasGas: true,
    hasElectricity: true,
    hasWater: true,
    hasSewage: true,
    hasInternet: true,
    hasParking: true,
    hasFurniture: true,
    hasSecurity: true,
    imageUrls: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'approved',
    createdAt: '2026-07-01T15:30:00Z',
    rating: 4.8
  },
  {
    id: 'listing-3',
    ownerName: 'Sherzod Toshpo\'latov',
    ownerPhone: '+998 97 111 22 33',
    ownerTelegram: '@sherzod_commercial',
    title: 'Chilonzorda 4 qavatli biznes markazi / Ofis binosi',
    dealType: 'rent',
    propertyType: 'commercial',
    regionId: 'tashkent-city',
    districtId: 'chilonzor',
    address: 'Chilonzor ko\'chasi, G\'afur G\'ulom bog\'i qarshisida',
    googleMapUrl: 'https://maps.google.com/?q=41.2825,69.2154',
    price: 8500, // Monthly rental for office building
    area: 1200,
    rooms: 24,
    floor: 1,
    maxFloors: 4,
    description: 'Chilonzor tumanida joylashgan 4 qavatli mustaqil biznes markazi binosi ijaraga beriladi. Ofislar to\'liq tayyor holatda, zamonaviy konditsionerlash, xavfsizlik kameralari va keng parkovka mavjud. IT kompaniyalar, klinikalar, o\'quv markazlari yoki bank filiali uchun ajoyib tanlov.',
    isPremium: false,
    viewsCount: 512,
    reportsCount: 1,
    hasGas: true,
    hasElectricity: true,
    hasWater: true,
    hasSewage: true,
    hasInternet: true,
    hasParking: true,
    hasFurniture: false,
    hasSecurity: true,
    imageUrls: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'approved',
    createdAt: '2026-07-03T09:15:00Z',
    rating: 4.5
  },
  {
    id: 'listing-4',
    ownerName: 'Tashkent City Admin',
    ownerPhone: '+998 71 200 00 00',
    ownerTelegram: '@tc_gardens',
    title: 'Tashkent City Gardens Residence - 4 xonali premium novostroyka',
    dealType: 'sale',
    propertyType: 'new_building',
    regionId: 'tashkent-city',
    districtId: 'mirobod',
    address: 'Tashkent City Gardens Residence Park',
    googleMapUrl: 'https://maps.google.com/?q=41.3111,69.2555',
    price: 320000,
    area: 145,
    rooms: 4,
    floor: 12,
    maxFloors: 16,
    description: 'Tashkent City hududidagi eng nufuzli turar-joy majmualaridan biri Gardens Residence-da premium darajadagi xonadon sotiladi. 4 xonali, shift balandligi 3.4 metr. Aqlli uy tizimi, panoramali darchalar orqali go\'zal favvoralar maydoni ko\'rinadi. Hudud to\'liq qo\'riqlanadi.',
    isPremium: true,
    viewsCount: 2240,
    reportsCount: 0,
    hasGas: true,
    hasElectricity: true,
    hasWater: true,
    hasSewage: true,
    hasInternet: true,
    hasParking: true,
    hasFurniture: true,
    hasSecurity: true,
    imageUrls: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'approved',
    createdAt: '2026-07-05T10:00:00Z',
    rating: 5.0
  },
  {
    id: 'listing-5',
    ownerName: 'Sardor Qodirov',
    ownerPhone: '+998 99 888 77 66',
    ownerTelegram: '@sardor_zemlya',
    title: 'Bo\'stonliq tumanida, tog\' etagida 12 sotix yer maydoni',
    dealType: 'sale',
    propertyType: 'land',
    regionId: 'tashkent-region',
    districtId: 'bostonliq',
    address: 'Chimgan qishlog\'i, tog\' bag\'rida',
    googleMapUrl: 'https://maps.google.com/?q=41.5642,70.0234',
    price: 45000,
    area: 1200, // 12 sotix = 1200 m2
    rooms: 0,
    description: 'Chimgan va Chorvoqqa yaqin bo\'lgan eng go\'zal tog\'li hududda 12 sotix unumdor va tekis yer maydoni sotiladi. Shaxsiy dacha, kottej yoki dam olish maskani qurish uchun ideal joy. Elektr va suv tarmoqlari ulangan, gaz tarmog\'i 100 metr masofada. Hujjatlari 100% tayyor (kadastr bor).',
    isPremium: false,
    viewsCount: 310,
    reportsCount: 0,
    hasGas: false,
    hasElectricity: true,
    hasWater: true,
    hasSewage: false,
    hasInternet: false,
    hasParking: true,
    hasFurniture: false,
    hasSecurity: false,
    imageUrls: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    status: 'pending',
    createdAt: '2026-07-07T05:00:00Z',
    rating: 4.2
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r-1',
    listingId: 'listing-1',
    userName: 'Farrukh Alimov',
    userAvatar: 'https://ui-avatars.com/api/?name=Farrukh+Alimov&background=2563eb&color=fff',
    rating: 5,
    comment: 'Oybekdagi kvartirani borib ko\'rdik, aytilganidan ham yaxshi holatda ekan. Realtor Rustam aka barcha hujjatlarni juda tez rasmiylashtirishga yordam berdi. Juda mamnunmiz!',
    createdAt: '2026-07-02T11:00:00Z'
  },
  {
    id: 'r-2',
    listingId: 'listing-1',
    userName: 'Madina Shodieva',
    userAvatar: 'https://ui-avatars.com/api/?name=Madina+Shodieva&background=e11d48&color=fff',
    rating: 4.8,
    comment: 'Kvartira haqiqatan ham juda shinam va markazda joylashgan. Narxiga 100% arziydi, hamma sharoiti premium.',
    createdAt: '2026-07-05T08:30:00Z'
  },
  {
    id: 'r-3',
    listingId: 'listing-2',
    userName: 'Shaxzod Tursunov',
    userAvatar: 'https://ui-avatars.com/api/?name=Shaxzod+Tursunov&background=10b981&color=fff',
    rating: 5,
    comment: 'Yunusoboddagi hovlini kompaniyamiz direktori uchun ijaraga oldik. Aziza opa juda muloyim va professional ekan. Uyning tozaligi va xavfsizligi eng yuqori darajada.',
    createdAt: '2026-07-04T16:00:00Z'
  }
];
