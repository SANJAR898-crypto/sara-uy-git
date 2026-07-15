import type { AppNotification, Category, Property, Seller, Story } from "./types";

const interiorImages = [
  "https://images.pexels.com/photos/7167073/pexels-photo-7167073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/8135492/pexels-photo-8135492.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7173666/pexels-photo-7173666.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/8135496/pexels-photo-8135496.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/6920439/pexels-photo-6920439.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
];

const exteriorImages = [
  "https://images.pexels.com/photos/7031581/pexels-photo-7031581.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/27953061/pexels-photo-27953061.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7031604/pexels-photo-7031604.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/34147672/pexels-photo-34147672.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7031405/pexels-photo-7031405.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7031412/pexels-photo-7031412.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/16787446/pexels-photo-16787446.png?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
  "https://images.pexels.com/photos/7031407/pexels-photo-7031407.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400",
];

function makeSeller(i: number, overrides: Partial<Seller> = {}): Seller {
  const names = [
    "Bekzod Rahimov",
    "Sara Uylar Agency",
    "Dilnoza Karimova",
    "Otabek Yusupov",
    "Madina Tosheva",
    "Jasur Nazarov",
  ];
  return {
    id: `seller-${i}`,
    name: names[i % names.length],
    avatar: `https://i.pravatar.cc/150?img=${(i % 60) + 1}`,
    verified: i % 2 === 0,
    isAgency: names[i % names.length].includes("Agency"),
    rating: +(4.2 + (i % 8) * 0.1).toFixed(1),
    dealsCount: 12 + i * 7,
    phone: "+998 90 123 45 67",
    memberSince: "2021",
    ...overrides,
  };
}

const categoryMeta: Record<string, { label: string; icon: string }> = {
  apartment: { label: "Kvartira", icon: "building-2" },
  house: { label: "Uy", icon: "home" },
  villa: { label: "Villa", icon: "castle" },
  office: { label: "Ofis", icon: "briefcase" },
  land: { label: "Yer", icon: "map" },
  rent: { label: "Ijara", icon: "key" },
};

const cities = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan"];
const districts = ["Yunusobod", "Mirzo Ulug'bek", "Chilonzor", "Yakkasaroy", "Shayxontohur", "Sergeli"];
const titlesByCategory: Record<string, string[]> = {
  apartment: ["Zamonaviy 3 xonali kvartira", "Yangi qurilgan kvartira", "Yevroremont kvartira", "Panorama ko'rinishli kvartira"],
  house: ["Hovlili zamonaviy uy", "2 qavatli oilaviy uy", "Yangi ta'mirlangan uy", "Bog'li shinam uy"],
  villa: ["Premium villa basseyn bilan", "Hashamatli villa", "Zamonaviy villa uchastka bilan"],
  office: ["Biznes markazda ofis", "Zamonaviy ofis xonasi", "Ko'p xonali ofis"],
  land: ["Qurilish uchun yer uchastkasi", "Tomorqa yer", "Investitsiya uchun yer"],
  rent: ["Ijaraga kvartira", "Kunlik ijara kvartira", "Oylik ijara xonadon"],
};

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export const categories: Category[] = (Object.keys(categoryMeta) as (keyof typeof categoryMeta)[]).map((id) => ({
  id: id as Property["category"],
  label: categoryMeta[id].label,
  icon: categoryMeta[id].icon,
}));

export const properties: Property[] = Array.from({ length: 24 }).map((_, i) => {
  const cats: Property["category"][] = ["apartment", "house", "villa", "office", "land", "rent"];
  const category = cats[i % cats.length];
  const dealType: Property["dealType"] = category === "rent" ? "rent" : i % 5 === 0 ? "rent" : "sale";
  const imgs = category === "land" || category === "office" ? exteriorImages : i % 2 === 0 ? interiorImages : exteriorImages;
  const shuffled = [...imgs].sort(() => 0.5 - ((i * 37) % 10) / 10);
  return {
    id: `prop-${i + 1}`,
    title: randomFrom(titlesByCategory[category], i),
    category,
    dealType,
    price: dealType === "rent" ? 300 + (i % 10) * 120 : 38000 + (i % 12) * 15500,
    currency: "USD",
    city: randomFrom(cities, i),
    district: randomFrom(districts, i + 3),
    rooms: 1 + (i % 5),
    area: 42 + (i % 10) * 18,
    floor: 1 + (i % 9),
    totalFloors: 9 + (i % 6),
    images: shuffled.slice(0, 5),
    isVip: i % 6 === 0,
    isVerified: i % 3 !== 0,
    isNew: i % 4 === 0,
    createdAt: `${1 + (i % 27)} kun oldin`,
    description:
      "Ushbu ob'ekt qulay joylashuvga ega, barcha kommunikatsiyalar mavjud. Yevroremont, sifatli qurilish materiallari ishlatilgan. Metro va bozorlarga yaqin, transport infratuzilmasi rivojlangan hududda joylashgan. Xavfsiz va tinch mahallada.",
    seller: makeSeller(i),
    views: 120 + i * 34,
  };
});

export const stories: Story[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `story-${i + 1}`,
  name: ["Yunusobod", "VIP uylar", "Chilonzor", "Yangi binolar", "Villalar", "Ofislar", "Ijaraga", "Aksiya", "Samarqand", "Buxoro"][i],
  avatar: `https://i.pravatar.cc/150?img=${i + 12}`,
  image: randomFrom([...interiorImages, ...exteriorImages], i * 3),
  isVip: i % 3 === 0,
  seen: i > 5,
}));

export const notifications: AppNotification[] = [
  { id: "n1", title: "Narx pasaydi", message: "Yunusobod tumanidagi kvartira narxi 3% ga pasaydi", time: "5 daq", read: false, type: "price" },
  { id: "n2", title: "Yangi xabar", message: "Bekzod Rahimov sizga xabar yubordi", time: "1 soat", read: false, type: "message" },
  { id: "n3", title: "VIP e'lon", message: "Sizning mahallangizda yangi VIP e'lon joylandi", time: "3 soat", read: true, type: "vip" },
  { id: "n4", title: "Tizim xabari", message: "Profilingiz muvaffaqiyatli tasdiqlandi", time: "Kecha", read: true, type: "system" },
  { id: "n5", title: "Yangi sharh", message: "E'loningizga yangi sharh qoldirildi", time: "2 kun", read: true, type: "message" },
];

export const currentUser = {
  name: "Sanjar Aliyev",
  phone: "+998 90 123 45 67",
  avatar: "https://i.pravatar.cc/150?img=33",
  verified: true,
  memberSince: "2023",
  listingsCount: 4,
  favoritesCount: 12,
  viewsCount: 1840,
};
