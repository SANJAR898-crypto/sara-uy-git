import "dotenv/config";
import { db, pool } from "@/db";
import { regions, districts, subscriptionPlans, stories, storySlides } from "@/db/schema";
import { sql } from "drizzle-orm";

const REGIONS = [
  { id: "tashkent-city", nameUz: "Toshkent shahri", nameRu: "Ташкент", nameEn: "Tashkent City", sortOrder: 1 },
  { id: "tashkent-region", nameUz: "Toshkent viloyati", nameRu: "Ташкентская область", nameEn: "Tashkent Region", sortOrder: 2 },
  { id: "samarkand-region", nameUz: "Samarqand viloyati", nameRu: "Самаркандская область", nameEn: "Samarkand Region", sortOrder: 3 },
  { id: "bukhara-region", nameUz: "Buxoro viloyati", nameRu: "Бухарская область", nameEn: "Bukhara Region", sortOrder: 4 },
  { id: "fergana-region", nameUz: "Farg'ona viloyati", nameRu: "Ферганская область", nameEn: "Fergana Region", sortOrder: 5 },
  { id: "andijan-region", nameUz: "Andijon viloyati", nameRu: "Андижанская область", nameEn: "Andijan Region", sortOrder: 6 },
  { id: "namangan-region", nameUz: "Namangan viloyati", nameRu: "Наманганская область", nameEn: "Namangan Region", sortOrder: 7 },
  { id: "khorezm-region", nameUz: "Xorazm viloyati", nameRu: "Хорезмская область", nameEn: "Khorezm Region", sortOrder: 8 },
  { id: "kashkadarya-region", nameUz: "Qashqadaryo viloyati", nameRu: "Кашкадарьинская область", nameEn: "Kashkadarya Region", sortOrder: 9 },
  { id: "surkhandarya-region", nameUz: "Surxondaryo viloyati", nameRu: "Сурхандарьинская область", nameEn: "Surkhandarya Region", sortOrder: 10 },
  { id: "navoi-region", nameUz: "Navoiy viloyati", nameRu: "Навоийская область", nameEn: "Navoi Region", sortOrder: 11 },
  { id: "jizzakh-region", nameUz: "Jizzax viloyati", nameRu: "Джизакская область", nameEn: "Jizzakh Region", sortOrder: 12 },
  { id: "syrdarya-region", nameUz: "Sirdaryo viloyati", nameRu: "Сырдарьинская область", nameEn: "Syrdarya Region", sortOrder: 13 },
  { id: "karakalpakstan", nameUz: "Qoraqalpog'iston Respublikasi", nameRu: "Республика Каракалпакстан", nameEn: "Republic of Karakalpakstan", sortOrder: 14 },
];

const DISTRICTS = [
  { id: "mirobod", regionId: "tashkent-city", nameUz: "Mirobod tumani", nameRu: "Мирабадский район", nameEn: "Mirabad District" },
  { id: "yunusobod", regionId: "tashkent-city", nameUz: "Yunusobod tumani", nameRu: "Юнусабадский район", nameEn: "Yunusabad District" },
  { id: "chilonzor", regionId: "tashkent-city", nameUz: "Chilonzor tumani", nameRu: "Чиланзарский район", nameEn: "Chilanzar District" },
  { id: "shayxontohur", regionId: "tashkent-city", nameUz: "Shayxontohur tumani", nameRu: "Шайхантахурский район", nameEn: "Shaykhantakhur District" },
  { id: "mirzo-ulugbek", regionId: "tashkent-city", nameUz: "Mirzo Ulug'bek tumani", nameRu: "Мирзо-Улугбекский район", nameEn: "Mirzo Ulugbek District" },
  { id: "yashnobod", regionId: "tashkent-city", nameUz: "Yashnobod tumani", nameRu: "Яшнабадский район", nameEn: "Yashnabad District" },
  { id: "olmazor", regionId: "tashkent-city", nameUz: "Olmazor tumani", nameRu: "Алмазарский район", nameEn: "Almazar District" },
  { id: "bektemir", regionId: "tashkent-city", nameUz: "Bektemir tumani", nameRu: "Бектемирский район", nameEn: "Bektemir District" },
  { id: "yakkasaroy", regionId: "tashkent-city", nameUz: "Yakkasaroy tumani", nameRu: "Яккасарайский район", nameEn: "Yakkasaray District" },
  { id: "sergeli", regionId: "tashkent-city", nameUz: "Sergeli tumani", nameRu: "Сергелийский район", nameEn: "Sergeli District" },
  { id: "uchtepa", regionId: "tashkent-city", nameUz: "Uchtepa tumani", nameRu: "Учтепинский район", nameEn: "Uchtepa District" },
  { id: "yangihayot", regionId: "tashkent-city", nameUz: "Yangihayot tumani", nameRu: "Янгихаётский район", nameEn: "Yangihayot District" },
  { id: "bostonliq", regionId: "tashkent-region", nameUz: "Bo'stonliq tumani", nameRu: "Бостанлыкский район", nameEn: "Bostanlyk District" },
  { id: "zangiota", regionId: "tashkent-region", nameUz: "Zangiota tumani", nameRu: "Зангиатинский район", nameEn: "Zangiata District" },
  { id: "qibray", regionId: "tashkent-region", nameUz: "Qibray tumani", nameRu: "Кибрайский район", nameEn: "Kibray District" },
  { id: "samarkand-city", regionId: "samarkand-region", nameUz: "Samarqand shahri", nameRu: "Самарканд", nameEn: "Samarkand City" },
  { id: "bukhara-city", regionId: "bukhara-region", nameUz: "Buxoro shahri", nameRu: "Бухара", nameEn: "Bukhara City" },
  { id: "fergana-city", regionId: "fergana-region", nameUz: "Farg'ona shahri", nameRu: "Фергана", nameEn: "Fergana City" },
  { id: "andijan-city", regionId: "andijan-region", nameUz: "Andijon shahri", nameRu: "Андижан", nameEn: "Andijan City" },
  { id: "namangan-city", regionId: "namangan-region", nameUz: "Namangan shahri", nameRu: "Наманган", nameEn: "Namangan City" },
];

const PLANS = [
  {
    id: "vip",
    name: "VIP",
    price: 99000,
    durationDays: 30,
    badge: "🥇 VIP",
    benefits: ["E'lon ro'yxat boshida turadi", "Kunlik 3 marta avtomatik yangilanadi", "VIP belgisi", "Statistika paneli"],
    sortOrder: 1,
  },
  {
    id: "premium",
    name: "Premium",
    price: 49000,
    durationDays: 30,
    badge: "🥈 Premium",
    benefits: ["VIP e'lonlar ostida yuqori o'rin", "Kunlik 1 marta yangilanadi", "Premium belgisi"],
    sortOrder: 2,
  },
  {
    id: "story",
    name: "Story",
    price: 15000,
    durationDays: 10,
    badge: "🎬 Story",
    benefits: ["Bosh sahifa Stories bo'limida", "10 kun davomida ko'rinadi"],
    sortOrder: 3,
  },
  {
    id: "standard",
    name: "Standard",
    price: 0,
    durationDays: 30,
    badge: "Standard",
    benefits: ["Bepul e'lon joylashtirish", "30 kun davomida faol"],
    sortOrder: 4,
  },
];

const STORIES = [
  {
    title: "Yangi Loyihalar",
    coverUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
    category: "developers",
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",
        title: "Dream City: Toshkent markazida premium xonadonlar",
        description: "Toshkent shahrida zamonaviy va hashamatli yangi turar-joy majmuasi.",
        linkText: "Batafsil",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
        title: "Foizsiz bo'lib to'lash",
        description: "18 oygacha foizsiz bo'lib to'lash imkoniyati bilan sotib oling.",
        linkText: "Aloqa",
      },
    ],
  },
  {
    title: "Tezkor Takliflar",
    coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    category: "offers",
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
        title: "Mirobodda shoshilinch sotiladigan uy",
        description: "Barcha jihozlari bilan 3 xonali uy juda qulay narxda.",
        linkText: "Ko'rish",
      },
    ],
  },
  {
    title: "Bozor Tahlili",
    coverUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80",
    category: "news",
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
        title: "2026-yil ko'chmas mulk bozori tendensiyalari",
        description: "Toshkentda kvartira narxlari qanday o'zgarmoqda — to'liq tahlil.",
        linkText: "O'qish",
      },
    ],
  },
];

async function seed() {
  console.log("Seeding regions...");
  for (const r of REGIONS) {
    await db.insert(regions).values(r).onConflictDoNothing();
  }

  console.log("Seeding districts...");
  for (const d of DISTRICTS) {
    await db.insert(districts).values(d).onConflictDoNothing();
  }

  console.log("Seeding subscription plans...");
  for (const p of PLANS) {
    await db.insert(subscriptionPlans).values(p).onConflictDoNothing();
  }

  const existingStories = await db.execute(sql`select count(*)::int as count from stories`);
  const storyCount = Number((existingStories.rows[0] as { count: number }).count);

  if (storyCount === 0) {
    console.log("Seeding stories...");
    for (let i = 0; i < STORIES.length; i++) {
      const s = STORIES[i];
      const [inserted] = await db
        .insert(stories)
        .values({
          title: s.title,
          coverUrl: s.coverUrl,
          category: s.category,
          isFeatured: true,
          sortOrder: i,
        })
        .returning();

      for (let j = 0; j < s.slides.length; j++) {
        const slide = s.slides[j];
        await db.insert(storySlides).values({
          storyId: inserted.id,
          imageUrl: slide.imageUrl,
          title: slide.title,
          description: slide.description,
          linkText: slide.linkText,
          sortOrder: j,
        });
      }
    }
  }

  console.log("Seed complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
