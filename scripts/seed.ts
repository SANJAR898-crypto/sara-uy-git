/**
 * Seed script — populates the database with realistic sample data
 * (users/sellers, properties, stories, notifications) sourced from
 * real stock photography. Run with: npx tsx scripts/seed.ts
 */
import { db, pool } from "../src/db";
import { favorites, notifications, properties, stories, users } from "../src/db/schema";
import { sql } from "drizzle-orm";

const AVATARS = [
  "https://images.pexels.com/photos/38197025/pexels-photo-38197025.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/14391923/pexels-photo-14391923.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/10812247/pexels-photo-10812247.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/36177188/pexels-photo-36177188.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/9092308/pexels-photo-9092308.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/19039168/pexels-photo-19039168.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/20022691/pexels-photo-20022691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
  "https://images.pexels.com/photos/12311546/pexels-photo-12311546.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400",
];

const APARTMENT_IMAGES = [
  "https://images.pexels.com/photos/7587828/pexels-photo-7587828.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/6920439/pexels-photo-6920439.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7167073/pexels-photo-7167073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7546648/pexels-photo-7546648.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7173666/pexels-photo-7173666.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/6489117/pexels-photo-6489117.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7031708/pexels-photo-7031708.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7587783/pexels-photo-7587783.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/8135496/pexels-photo-8135496.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
];

const VILLA_IMAGES = [
  "https://images.pexels.com/photos/8143683/pexels-photo-8143683.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7174110/pexels-photo-7174110.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7031600/pexels-photo-7031600.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/8143677/pexels-photo-8143677.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/8092387/pexels-photo-8092387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7031412/pexels-photo-7031412.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
];

const OFFICE_IMAGES = [
  "https://images.pexels.com/photos/5511098/pexels-photo-5511098.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/7534224/pexels-photo-7534224.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/5444186/pexels-photo-5444186.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/6794926/pexels-photo-6794926.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
];

const LAND_IMAGES = [
  "https://images.pexels.com/photos/4525178/pexels-photo-4525178.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/36422828/pexels-photo-36422828.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/38574684/pexels-photo-38574684.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/37386894/pexels-photo-37386894.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
];

function pick<T>(arr: T[], n: number, offset = 0): T[] {
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[(offset + i) % arr.length]);
  return out;
}

const DISTRICTS = ["Yunusobod", "Mirzo Ulug'bek", "Chilonzor", "Yakkasaroy", "Shayxontohur", "Sergeli"];
const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan"];

async function main() {
  console.log("Seeding database...");

  // ---- Admin + sellers ----
  const [admin] = await db
    .insert(users)
    .values({
      telegramId: 900000001,
      username: "sara_admin",
      firstName: "Sara",
      lastName: "Admin",
      role: "admin",
      isVerified: true,
      avatarUrl: AVATARS[0],
      rating: "5.0",
      dealsCount: 120,
    })
    .onConflictDoNothing()
    .returning();

  const sellerSeeds = [
    { telegramId: 900000101, firstName: "Aziz", lastName: "Karimov", isAgency: true, agencyName: "Toshkent Uy Servis", phone: "+998901234501" },
    { telegramId: 900000102, firstName: "Dilnoza", lastName: "Yusupova", isAgency: false, agencyName: null, phone: "+998901234502" },
    { telegramId: 900000103, firstName: "Rustam", lastName: "Tashkentov", isAgency: true, agencyName: "Premium Estate", phone: "+998901234503" },
    { telegramId: 900000104, firstName: "Malika", lastName: "Nazarova", isAgency: false, agencyName: null, phone: "+998901234504" },
    { telegramId: 900000105, firstName: "Jasur", lastName: "Alimov", isAgency: true, agencyName: "Golden House", phone: "+998901234505" },
  ];

  const sellers = [];
  for (let i = 0; i < sellerSeeds.length; i++) {
    const s = sellerSeeds[i];
    const [row] = await db
      .insert(users)
      .values({
        telegramId: s.telegramId,
        username: `${s.firstName?.toLowerCase()}_${s.lastName?.toLowerCase()}`,
        firstName: s.firstName,
        lastName: s.lastName,
        role: "seller",
        isAgency: s.isAgency,
        agencyName: s.agencyName,
        phone: s.phone,
        avatarUrl: AVATARS[(i + 1) % AVATARS.length],
        isVerified: i % 2 === 0,
        rating: (4.4 + i * 0.1).toFixed(1),
        dealsCount: 8 + i * 6,
      })
      .onConflictDoNothing()
      .returning();
    if (row) sellers.push(row);
  }

  // If sellers already existed (re-run), fetch them back
  let allSellers = sellers;
  if (allSellers.length === 0) {
    allSellers = await db.select().from(users).where(sql`role = 'seller'`);
  }

  const existingCount = await db.select({ c: sql<number>`count(*)::int` }).from(properties);
  if (existingCount[0]?.c && existingCount[0].c > 0) {
    console.log(`Properties already seeded (${existingCount[0].c} rows). Skipping property insert.`);
  } else {
    const listingDefs: Array<{
      title: string;
      category: string;
      dealType: string;
      price: number;
      currency: string;
      rooms: number;
      area: number;
      floor?: number;
      totalFloors?: number;
      images: string[];
      isVip: boolean;
      isNew: boolean;
      isVerified: boolean;
      views: number;
    }> = [
      { title: "Yunusobodda 3 xonali zamonaviy kvartira", category: "apartment", dealType: "sale", price: 78000, currency: "USD", rooms: 3, area: 92, floor: 7, totalFloors: 16, images: pick(APARTMENT_IMAGES, 4, 0), isVip: true, isNew: true, isVerified: true, views: 342 },
      { title: "Chilonzorda ta'mirlangan 2 xonali", category: "apartment", dealType: "sale", price: 54000, currency: "USD", rooms: 2, area: 61, floor: 3, totalFloors: 9, images: pick(APARTMENT_IMAGES, 4, 1), isVip: false, isNew: true, isVerified: true, views: 198 },
      { title: "Mirzo Ulug'bekda premium penthouse", category: "apartment", dealType: "sale", price: 145000, currency: "USD", rooms: 4, area: 148, floor: 14, totalFloors: 16, images: pick(APARTMENT_IMAGES, 5, 2), isVip: true, isNew: false, isVerified: true, views: 567 },
      { title: "Yakkasaroyda hovlili uy", category: "house", dealType: "sale", price: 96000, currency: "USD", rooms: 5, area: 210, images: pick(VILLA_IMAGES, 4, 0), isVip: false, isNew: true, isVerified: false, views: 121 },
      { title: "Sergelida yangi qurilgan uy", category: "house", dealType: "sale", price: 68000, currency: "USD", rooms: 4, area: 160, images: pick(VILLA_IMAGES, 4, 1), isVip: false, isNew: true, isVerified: true, views: 87 },
      { title: "Toshkent atrofida hashamatli villa", category: "villa", dealType: "sale", price: 320000, currency: "USD", rooms: 6, area: 420, images: pick(VILLA_IMAGES, 5, 2), isVip: true, isNew: false, isVerified: true, views: 890 },
      { title: "Zamonaviy villa, xususiy hovuz bilan", category: "villa", dealType: "sale", price: 275000, currency: "USD", rooms: 5, area: 380, images: pick(VILLA_IMAGES, 4, 3), isVip: true, isNew: true, isVerified: true, views: 654 },
      { title: "Shayxontohurda ofis binosi", category: "office", dealType: "rent", price: 1800, currency: "USD", rooms: 6, area: 220, floor: 2, totalFloors: 5, images: pick(OFFICE_IMAGES, 3, 0), isVip: false, isNew: false, isVerified: true, views: 245 },
      { title: "Biznes markazida premium ofis", category: "office", dealType: "rent", price: 3200, currency: "USD", rooms: 10, area: 340, floor: 8, totalFloors: 12, images: pick(OFFICE_IMAGES, 3, 1), isVip: true, isNew: false, isVerified: true, views: 412 },
      { title: "Qibray tumanida 8 sotix yer", category: "land", dealType: "sale", price: 32000, currency: "USD", rooms: 0, area: 800, images: pick(LAND_IMAGES, 3, 0), isVip: false, isNew: true, isVerified: false, views: 76 },
      { title: "Zangiotada tomorqa yeri", category: "land", dealType: "sale", price: 18500, currency: "USD", rooms: 0, area: 600, images: pick(LAND_IMAGES, 3, 1), isVip: false, isNew: false, isVerified: false, views: 54 },
      { title: "Chilonzorda ijaraga kvartira", category: "rent", dealType: "rent", price: 420, currency: "USD", rooms: 2, area: 58, floor: 5, totalFloors: 9, images: pick(APARTMENT_IMAGES, 3, 4), isVip: false, isNew: true, isVerified: true, views: 289 },
      { title: "Yunusobodda kunlik ijara studio", category: "rent", dealType: "rent", price: 35, currency: "USD", rooms: 1, area: 34, floor: 4, totalFloors: 12, images: pick(APARTMENT_IMAGES, 3, 6), isVip: false, isNew: true, isVerified: false, views: 156 },
      { title: "Samarqandda oilaviy uy", category: "house", dealType: "sale", price: 52000, currency: "USD", rooms: 4, area: 175, images: pick(VILLA_IMAGES, 3, 4), isVip: false, isNew: false, isVerified: true, views: 98 },
      { title: "Buxoroda tarixiy uslubdagi hovli", category: "house", dealType: "sale", price: 61000, currency: "USD", rooms: 5, area: 195, images: pick(VILLA_IMAGES, 3, 5), isVip: false, isNew: false, isVerified: false, views: 143 },
      { title: "Andijonda yangi kvartira", category: "apartment", dealType: "sale", price: 41000, currency: "USD", rooms: 3, area: 78, floor: 2, totalFloors: 5, images: pick(APARTMENT_IMAGES, 3, 7), isVip: false, isNew: true, isVerified: true, views: 65 },
      { title: "Namanganda VIP villa", category: "villa", dealType: "sale", price: 210000, currency: "USD", rooms: 5, area: 360, images: pick(VILLA_IMAGES, 3, 6), isVip: true, isNew: true, isVerified: true, views: 432 },
      { title: "Mirzo Ulug'bekda 1 xonali", category: "apartment", dealType: "sale", price: 32000, currency: "USD", rooms: 1, area: 42, floor: 9, totalFloors: 16, images: pick(APARTMENT_IMAGES, 3, 9), isVip: false, isNew: true, isVerified: false, views: 210 },
    ];

    for (let i = 0; i < listingDefs.length; i++) {
      const def = listingDefs[i];
      const seller = allSellers[i % allSellers.length];
      const city = CITIES[i % CITIES.length];
      const district = DISTRICTS[i % DISTRICTS.length];
      await db.insert(properties).values({
        title: def.title,
        description: `${def.title}. Barcha qulayliklar mavjud, metro va ijtimoiy infratuzilmaga yaqin joylashgan. Hujjatlar toza, sotuvchi bilan to'g'ridan-to'g'ri muzokara imkoniyati mavjud.`,
        category: def.category,
        dealType: def.dealType,
        price: String(def.price),
        currency: def.currency,
        city,
        district,
        address: `${district} tumani, ${i + 1}-mavze`,
        lat: 41.28 + (i % 10) * 0.01,
        lng: 69.19 + (i % 10) * 0.015,
        rooms: def.rooms,
        area: def.area,
        floor: def.floor ?? null,
        totalFloors: def.totalFloors ?? null,
        images: def.images,
        isVip: def.isVip,
        isVerified: def.isVerified,
        isNew: def.isNew,
        status: "active",
        views: def.views,
        sellerId: seller.id,
      });
    }
    console.log(`Inserted ${listingDefs.length} properties.`);
  }

  // ---- Stories ----
  const existingStories = await db.select({ c: sql<number>`count(*)::int` }).from(stories);
  if (!existingStories[0]?.c) {
    const storyDefs = [
      { name: "VIP e'lonlar", avatarUrl: AVATARS[0], imageUrl: VILLA_IMAGES[0], isVip: true },
      { name: "Yangi binolar", avatarUrl: AVATARS[1], imageUrl: APARTMENT_IMAGES[0], isVip: false },
      { name: "Chegirmalar", avatarUrl: AVATARS[2], imageUrl: APARTMENT_IMAGES[2], isVip: false },
      { name: "Villalar", avatarUrl: AVATARS[3], imageUrl: VILLA_IMAGES[4], isVip: true },
      { name: "Ofislar", avatarUrl: AVATARS[4], imageUrl: OFFICE_IMAGES[0], isVip: false },
      { name: "Yer uchastka", avatarUrl: AVATARS[5], imageUrl: LAND_IMAGES[0], isVip: false },
    ];
    for (let i = 0; i < storyDefs.length; i++) {
      const s = storyDefs[i];
      await db.insert(stories).values({ ...s, sortOrder: i });
    }
    console.log(`Inserted ${storyDefs.length} stories.`);
  } else {
    console.log("Stories already seeded. Skipping.");
  }

  // ---- Notifications (global, userId null so any signed-in user sees them) ----
  const existingNotifs = await db.select({ c: sql<number>`count(*)::int` }).from(notifications);
  if (!existingNotifs[0]?.c) {
    await db.insert(notifications).values([
      { userId: null, title: "Xush kelibsiz!", message: "Sara Uylar platformasiga xush kelibsiz. Eng yaxshi uylarni shu yerdan toping.", type: "system", read: false },
      { userId: null, title: "Yangi VIP e'lonlar", message: "Sizning shahringizda yangi VIP e'lonlar qo'shildi.", type: "vip", read: false },
      { userId: null, title: "Narx tushdi", message: "Kuzatilayotgan e'lonlardan birida narx pasaytirildi.", type: "price", read: true },
    ]);
    console.log("Inserted notifications.");
  } else {
    console.log("Notifications already seeded. Skipping.");
  }

  console.log("Seed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
