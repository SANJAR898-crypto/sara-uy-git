import fs from 'fs';
import path from 'path';
import { 
  Listing, User, Payment, Inquiry, Review, 
  Region, District, SubscriptionPlan, SubscriptionHistoryItem,
  GuestUser, SellerProfile, AdminProfile, ListingImage, ListingVideo,
  Story, StoryView, Favorite, SearchHistory, Notification,
  Subscription, Report, Analytics, PropertyTypeEntity, Amenity,
  VerificationRequest, PhoneVerification, ActivityLog, AuditLog, PropertyType
} from '../../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Define the full DB schema in JSON for backward compatibility and scalable normalization
export interface AppDatabase {
  regions: Region[];
  districts: District[];
  listings: Listing[];
  inquiries: Inquiry[];
  reviews: Review[];
  plans: SubscriptionPlan[];
  subscriptionHistory: SubscriptionHistoryItem[];
  users: User[];
  payments: Payment[];
  subscribers: number[]; // Telegram subscriber chat IDs
  
  // Normalized Tables
  guestUsers: GuestUser[];
  sellerProfiles: SellerProfile[];
  adminProfiles: AdminProfile[];
  listingImages: ListingImage[];
  listingVideos: ListingVideo[];
  stories: Story[];
  storyViews: StoryView[];
  favorites: Favorite[];
  searchHistory: SearchHistory[];
  notifications: Notification[];
  subscriptions: Subscription[];
  reports: Report[];
  analytics: Analytics[];
  propertyTypes: PropertyTypeEntity[];
  amenities: Amenity[];
  verificationRequests: VerificationRequest[];
  phoneVerifications: PhoneVerification[];
  activityLogs: ActivityLog[];
  auditLogs: AuditLog[];
}

// Initial default data if file doesn't exist
const INITIAL_REGIONS: Region[] = [
  { id: 'tashkent-city', name: "Toshkent shahri", nameUz: "Toshkent shahri", nameUzCyrl: "Тошкент шаҳри", nameRu: "Ташкент", nameEn: "Tashkent City" },
  { id: 'tashkent-region', name: "Toshkent viloyati", nameUz: "Toshkent viloyati", nameUzCyrl: "Тошкент вилояти", nameRu: "Ташкентская область", nameEn: "Tashkent Region" },
  { id: 'samarkand-region', name: "Samarqand viloyati", nameUz: "Samarqand viloyati", nameUzCyrl: "Самарқанд вилояти", nameRu: "Самаркандская область", nameEn: "Samarkand Region" },
];

const INITIAL_DISTRICTS: District[] = [
  { id: 'mirobod', regionId: 'tashkent-city', name: "Mirobod tumani", nameUz: "Mirobod tumani", nameUzCyrl: "Миробод тумани", nameRu: "Мирабадский район", nameEn: "Mirabad District" },
  { id: 'yunusobod', regionId: 'tashkent-city', name: "Yunusobod tumani", nameUz: "Yunusobod tumani", nameUzCyrl: "Юнусобод tumani", nameRu: "Юнусабадский район", nameEn: "Yunusabad District" },
  { id: 'chilonzor', regionId: 'tashkent-city', name: "Chilonzor tumani", nameUz: "Chilonzor tumani", nameUzCyrl: "Чилонзор tumani", nameRu: "Чиланзарский район", nameEn: "Chilanzar District" },
  { id: 'bostonliq', regionId: 'tashkent-region', name: "Bo'stonliq tumani", nameUz: "Bo'stonliq tumani", nameUzCyrl: "Бўстонлиқ тумани", nameRu: "Бостанлыкский район", nameEn: "Bostanlyk District" },
  { id: 'zangiota', regionId: 'tashkent-region', name: "Zangiota tumani", nameUz: "Zangiota tumani", nameUzCyrl: "Зангиота тумани", nameRu: "Зангиатинский район", nameEn: "Zangiata District" },
  { id: 'samarkand-city', regionId: 'samarkand-region', name: "Samarqand shahri", nameUz: "Samarqand shahri", nameUzCyrl: "Самарқанд шаҳри", nameRu: "Самарканд", nameEn: "Samarkand City" },
];

const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: 'vip', name: 'VIP', price: 99000, durationDays: 30, badge: '🥇 VIP', benefits: ['E\'lon yuqorida turadi', 'Kunlik 3 marta avtomatik yangilash', 'Telegram botda reklama', 'VIP belgisi'], visibility: 'Eng yuqori', priority: 'VIP' },
  { id: 'premium', name: 'Premium', price: 49000, durationDays: 30, badge: '🥈 Premium', benefits: ['VIP e\'lonlar ostida turadi', 'Kunlik 1 marta avtomatik yangilash', 'Premium belgisi'], visibility: 'Yuqori', priority: 'Premium' },
  { id: 'story', name: 'Story (Istoriya)', price: 15000, durationDays: 10, badge: '🎬 Story', benefits: ['Asosiy sahifa tepasidagi Stories qismida', '10 kun davomida ko\'rinadi'], visibility: 'Alohida panel', priority: 'Normal' },
  { id: 'standard', name: 'Standard', price: 0, durationDays: 30, badge: '🥉 Standard', benefits: ['Bepul e\'lon berish', '30 kun ko\'rinadi'], visibility: 'Oddiy', priority: 'Normal' }
];

const INITIAL_PROPERTY_TYPES: PropertyTypeEntity[] = [
  { id: 'pt-1', code: 'apartment', nameUz: 'Kvartira', nameUzCyrl: 'Квартира', nameRu: 'Квартира', nameEn: 'Apartment' },
  { id: 'pt-2', code: 'house', nameUz: 'Hovli / Uy', nameUzCyrl: 'Ҳовли / Уй', nameRu: 'Дом', nameEn: 'House' },
  { id: 'pt-3', code: 'villa', nameUz: 'Villa', nameUzCyrl: 'Вилла', nameRu: 'Вилла', nameEn: 'Villa' },
  { id: 'pt-4', code: 'cottage', nameUz: 'Kottej', nameUzCyrl: 'Коттедж', nameRu: 'Коттедж', nameEn: 'Cottage' },
  { id: 'pt-5', code: 'commercial', nameUz: 'Tijorat binosi', nameUzCyrl: 'Тижорат биноси', nameRu: 'Коммерческая недвижимость', nameEn: 'Commercial' },
  { id: 'pt-6', code: 'office', nameUz: 'Ofis', nameUzCyrl: 'Офис', nameRu: 'Офис', nameEn: 'Office' },
  { id: 'pt-7', code: 'land', nameUz: 'Yer uchastkasi', nameUzCyrl: 'Ер участкаси', nameRu: 'Земля', nameEn: 'Land' },
  { id: 'pt-8', code: 'warehouse', nameUz: 'Omborxona', nameUzCyrl: 'Омборхона', nameRu: 'Склад', nameEn: 'Warehouse' },
  { id: 'pt-9', code: 'new_building', nameUz: 'Yangi qurilgan bino', nameUzCyrl: 'Янги қурилган бино', nameRu: 'Новостройка', nameEn: 'New Building' },
];

const INITIAL_AMENITIES: Amenity[] = [
  { id: 'am-1', code: 'parking', nameUz: 'Avtoturargoh', nameUzCyrl: 'Автотураргоҳ', nameRu: 'Парковка', nameEn: 'Parking', icon: 'parking' },
  { id: 'am-2', code: 'elevator', nameUz: 'Lift', nameUzCyrl: 'Лифт', nameRu: 'Лифт', nameEn: 'Elevator', icon: 'elevator' },
  { id: 'am-3', code: 'internet', nameUz: 'Internet (Wi-Fi)', nameUzCyrl: 'Интернет', nameRu: 'Интернет', nameEn: 'Internet', icon: 'wifi' },
  { id: 'am-4', code: 'gas', nameUz: 'Tabiiy gaz', nameUzCyrl: 'Табиий газ', nameRu: 'Газ', nameEn: 'Gas', icon: 'flame' },
  { id: 'am-5', code: 'water', nameUz: 'Doimiy suv', nameUzCyrl: 'Доимий сув', nameRu: 'Вода', nameEn: 'Water', icon: 'droplet' },
  { id: 'am-6', code: 'electricity', nameUz: 'Elektr energiyasi', nameUzCyrl: 'Электр энергияси', nameRu: 'Электричество', nameEn: 'Electricity', icon: 'zap' },
  { id: 'am-7', code: 'security', nameUz: 'Xavfsizlik tizimi', nameUzCyrl: 'Хавфсизлик тизими', nameRu: 'Охрана', nameEn: 'Security', icon: 'shield' },
  { id: 'am-8', code: 'furniture', nameUz: 'Mebellar', nameUzCyrl: 'Мебеллар', nameRu: 'Мебель', nameEn: 'Furniture', icon: 'sofa' },
  { id: 'am-9', code: 'ac', nameUz: 'Konditsioner', nameUzCyrl: 'Кондиционер', nameRu: 'Кондиционер', nameEn: 'Air Conditioner', icon: 'wind' },
  { id: 'am-10', code: 'heating', nameUz: 'Isitish tizimi', nameUzCyrl: 'Иситиш тизими', nameRu: 'Отопление', nameEn: 'Heating', icon: 'thermometer' },
  { id: 'am-11', code: 'garden', nameUz: 'Bog\'', nameUzCyrl: 'Боғ', nameRu: 'Сад', nameEn: 'Garden', icon: 'flower' },
  { id: 'am-12', code: 'pool', nameUz: 'Basseyn', nameUzCyrl: 'Бассейн', nameRu: 'Бассейн', nameEn: 'Swimming Pool', icon: 'waves' },
  { id: 'am-13', code: 'playground', nameUz: 'Bolalar maydonchasi', nameUzCyrl: 'Болалар майдончаси', nameRu: 'Детская площадка', nameEn: 'Playground', icon: 'smile' },
];

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'Yangi Loyihalar',
    coverUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    category: 'developers',
    isFeatured: true,
    createdAt: new Date().toISOString(),
    viewsCount: 154,
    slides: [
      {
        id: 's1-1',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        title: 'Dream City: Toshkent markazida premium xonadonlar',
        description: 'Toshkent shahrida misli ko\'rilmagan shinamlik va hashamatli yangi turar-joy majmuasi.',
        linkText: 'Batafsil',
        linkUrl: 'https://t.me/SaraUylar_bot'
      },
      {
        id: 's1-2',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        title: 'Foizsiz Bo\'lib To\'lash',
        description: '18 oygacha foizsiz bo\'lib to\'lash imkoniyati bilan sotib oling.',
        linkText: 'Aloqa',
        linkUrl: 'https://t.me/SaraUylar_bot'
      }
    ]
  },
  {
    id: 'story-2',
    title: 'Tezkor Takliflar',
    coverUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80',
    category: 'offers',
    isFeatured: true,
    createdAt: new Date().toISOString(),
    viewsCount: 210,
    slides: [
      {
        id: 's2-1',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        title: 'Mirobodda Shoshilinch Sotiladigan Uy',
        description: 'Barcha jihozlari bilan 3 xonali uy juda arzon narxda sotiladi. Shoshiling!',
        linkText: 'Ko\'rish',
        linkUrl: 'https://t.me/SaraUylar_bot'
      }
    ]
  }
];

export interface IDatabaseRepository {
  // Regions
  getRegions(): Promise<Region[]>;
  createRegion(region: Region): Promise<Region>;
  
  // Districts
  getDistricts(): Promise<District[]>;
  createDistrict(district: District): Promise<District>;
  
  // Listings
  getListings(): Promise<Listing[]>;
  getListingById(id: string): Promise<Listing | null>;
  createListing(listing: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'reportsCount' | 'rating'>): Promise<Listing>;
  updateListing(id: string, updates: Partial<Listing>): Promise<Listing>;
  deleteListing(id: string): Promise<boolean>;
  
  // Users & Profiles
  getUsers(): Promise<User[]>;
  getUserByTelegramId(telegramId: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'joinedDate'>): Promise<User>;
  updateUser(telegramId: string, updates: Partial<User>): Promise<User>;
  getSellerProfiles(): Promise<SellerProfile[]>;
  getSellerProfileByUserId(userId: string): Promise<SellerProfile | null>;
  createSellerProfile(profile: Omit<SellerProfile, 'id' | 'joinedDate'>): Promise<SellerProfile>;
  updateSellerProfile(userId: string, updates: Partial<SellerProfile>): Promise<SellerProfile>;
  getAdminProfiles(): Promise<AdminProfile[]>;
  getAdminProfileByUserId(userId: string): Promise<AdminProfile | null>;
  
  // Payments
  getPayments(): Promise<Payment[]>;
  createPayment(payment: Omit<Payment, 'id' | 'status' | 'createdAt'>): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
  
  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<Inquiry>;
  updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry>;
  
  // Reviews
  getReviews(): Promise<Review[]>;
  createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
  updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<Review>;
  
  // Plans & Subscriptions
  getPlans(): Promise<SubscriptionPlan[]>;
  createPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan>;
  updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  getSubscriptionHistory(): Promise<SubscriptionHistoryItem[]>;
  createSubscriptionHistoryItem(item: Omit<SubscriptionHistoryItem, 'id'>): Promise<SubscriptionHistoryItem>;
  getSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription>;
  
  // Subscribers
  getSubscribers(): Promise<number[]>;
  addSubscriber(chatId: number): Promise<boolean>;
  removeSubscriber(chatId: number): Promise<boolean>;

  // Stories
  getStories(): Promise<Story[]>;
  createStory(story: Omit<Story, 'id' | 'createdAt'>): Promise<Story>;
  incrementStoryViews(storyId: string, userId?: string, guestId?: string): Promise<void>;
  
  // Favorites
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  toggleFavorite(userId: string, listingId: string): Promise<boolean>;
  
  // Search History
  getSearchHistory(userId?: string, guestId?: string): Promise<SearchHistory[]>;
  addSearchQuery(query: string, filters?: any, userId?: string, guestId?: string): Promise<SearchHistory>;
  
  // Reports
  getReports(): Promise<Report[]>;
  createReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report>;
  updateReportStatus(id: string, status: 'reviewed' | 'resolved', adminNotes?: string): Promise<Report>;
  
  // Analytics
  getAnalytics(): Promise<Analytics[]>;
  logEvent(eventType: Analytics['eventType'], userId?: string, guestId?: string, listingId?: string, metadata?: any): Promise<Analytics>;
  
  // Amenities & Property Types
  getAmenities(): Promise<Amenity[]>;
  getPropertyTypes(): Promise<PropertyTypeEntity[]>;
  
  // Verifications
  getPhoneVerifications(): Promise<PhoneVerification[]>;
  createPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification>;
  verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean>;
  
  // Logs
  getActivityLogs(): Promise<ActivityLog[]>;
  logActivity(action: string, userId?: string, guestId?: string, ipAddress?: string, userAgent?: string): Promise<ActivityLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  logAudit(adminUserId: string, action: string, entityName: string, entityId: string, previousState?: any, newState?: any): Promise<AuditLog>;
  
  // System Reset
  resetSystem(): Promise<boolean>;
}

export class JsonFileRepository implements IDatabaseRepository {
  private cache: AppDatabase | null = null;

  private load(): AppDatabase {
    if (this.cache) return this.cache;
    
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const db = JSON.parse(data);
        let modified = false;
        
        // Ensure standard defaults exist
        if (!db.regions) { db.regions = INITIAL_REGIONS; modified = true; }
        if (!db.districts) { db.districts = INITIAL_DISTRICTS; modified = true; }
        if (!db.listings) { db.listings = []; modified = true; }
        if (!db.inquiries) { db.inquiries = []; modified = true; }
        if (!db.reviews) { db.reviews = []; modified = true; }
        if (!db.plans) { db.plans = INITIAL_PLANS; modified = true; }
        if (!db.subscriptionHistory) { db.subscriptionHistory = []; modified = true; }
        if (!db.users) { db.users = []; modified = true; }
        if (!db.payments) { db.payments = []; modified = true; }
        if (!db.subscribers) { db.subscribers = []; modified = true; }
        
        // Ensure new scalable normalized entities exist
        if (!db.guestUsers) { db.guestUsers = []; modified = true; }
        if (!db.sellerProfiles) { db.sellerProfiles = []; modified = true; }
        if (!db.adminProfiles) { db.adminProfiles = []; modified = true; }
        if (!db.listingImages) { db.listingImages = []; modified = true; }
        if (!db.listingVideos) { db.listingVideos = []; modified = true; }
        if (!db.stories) { db.stories = INITIAL_STORIES; modified = true; }
        if (!db.storyViews) { db.storyViews = []; modified = true; }
        if (!db.favorites) { db.favorites = []; modified = true; }
        if (!db.searchHistory) { db.searchHistory = []; modified = true; }
        if (!db.notifications) { db.notifications = []; modified = true; }
        if (!db.subscriptions) { db.subscriptions = []; modified = true; }
        if (!db.reports) { db.reports = []; modified = true; }
        if (!db.analytics) { db.analytics = []; modified = true; }
        if (!db.propertyTypes) { db.propertyTypes = INITIAL_PROPERTY_TYPES; modified = true; }
        if (!db.amenities) { db.amenities = INITIAL_AMENITIES; modified = true; }
        if (!db.verificationRequests) { db.verificationRequests = []; modified = true; }
        if (!db.phoneVerifications) { db.phoneVerifications = []; modified = true; }
        if (!db.activityLogs) { db.activityLogs = []; modified = true; }
        if (!db.auditLogs) { db.auditLogs = []; modified = true; }

        // AUTOMATIC MIGRATION: 
        // 1. Image Migration (Listings to ListingImages)
        if (db.listings && db.listings.length > 0 && db.listingImages.length === 0) {
          console.log("Migrating Listing Images to ListingImage table...");
          db.listings.forEach((listing: Listing) => {
            if (listing.imageUrls && Array.isArray(listing.imageUrls)) {
              listing.imageUrls.forEach((url, index) => {
                db.listingImages.push({
                  id: `img-${listing.id}-${index}-${Date.now()}`,
                  listingId: listing.id,
                  url: url,
                  order: index,
                  isThumbnail: index === 0,
                  compressedUrl: url
                });
              });
            }
            if (listing.videoUrl && !db.listingVideos.some((v: any) => v.listingId === listing.id)) {
              db.listingVideos.push({
                id: `vid-${listing.id}-${Date.now()}`,
                listingId: listing.id,
                url: listing.videoUrl,
                provider: 'local'
              });
            }
          });
          modified = true;
        }

        // 2. User to SellerProfile Migration
        if (db.users && db.users.length > 0 && db.sellerProfiles.length === 0) {
          console.log("Migrating Users to SellerProfiles...");
          db.users.forEach((user: User) => {
            const listingsCount = db.listings.filter((l: Listing) => l.ownerName === user.fullName || l.ownerPhone === user.phoneNumber).length;
            db.sellerProfiles.push({
              id: `seller-${user.id}`,
              userId: user.id,
              bio: `I am a seller in SaraUylar platform.`,
              rating: user.isVerifiedSeller ? 4.9 : 4.5,
              joinedDate: user.joinedDate || new Date().toISOString(),
              verificationStatus: user.isVerifiedSeller ? 'verified' : 'unverified',
              activeListingsCount: listingsCount,
              soldListingsCount: 0,
              responseTime: "10 daqiqa",
              isPremium: user.packageId === 'premium' || user.packageId === 'vip',
              isVIP: user.packageId === 'vip'
            });
          });
          modified = true;
        }

        // 3. User Deduplication
        if (db.users && Array.isArray(db.users)) {
          const userMap = new Map<string, User>();
          for (const u of db.users) {
            if (!u.telegramId) continue;
            const existing = userMap.get(u.telegramId);
            if (!existing) {
              userMap.set(u.telegramId, u);
            } else {
              const merged: User = {
                ...existing,
                ...u,
                phoneNumber: u.phoneNumber || existing.phoneNumber,
                phone_verified: u.phone_verified || existing.phone_verified || u.isVerifiedSeller || existing.isVerifiedSeller || false,
                isVerifiedSeller: u.isVerifiedSeller || existing.isVerifiedSeller || false,
                isRegistered: u.isRegistered || existing.isRegistered || false
              };
              userMap.set(u.telegramId, merged);
              modified = true;
            }
          }
          db.users = Array.from(userMap.values());
        }

        // Enforce VIP, Premium & stats structure on Listing entities
        db.listings.forEach((listing: Listing) => {
          if (listing.currency === undefined) { listing.currency = 'USD'; modified = true; }
          if (listing.isNegotiable === undefined) { listing.isNegotiable = true; modified = true; }
          if (listing.isVIP === undefined) { listing.isVIP = listing.plan === 'vip'; modified = true; }
          if (listing.isPremium === undefined) { listing.isPremium = listing.plan === 'premium' || listing.plan === 'vip'; modified = true; }
          if (listing.isFeatured === undefined) { listing.isFeatured = false; modified = true; }
          if (listing.isUrgent === undefined) { listing.isUrgent = false; modified = true; }
          if (listing.favoritesCount === undefined) { listing.favoritesCount = db.favorites.filter((f: any) => f.listingId === listing.id).length; modified = true; }
          if (listing.sharesCount === undefined) { listing.sharesCount = 0; modified = true; }
        });

        if (modified) {
          this.save(db);
        }

        this.cache = db;
        return db;
      }
    } catch (err) {
      console.error('Error reading JSON file db:', err);
    }

    const defaultDB: AppDatabase = {
      regions: INITIAL_REGIONS,
      districts: INITIAL_DISTRICTS,
      listings: [],
      inquiries: [],
      reviews: [],
      plans: INITIAL_PLANS,
      subscriptionHistory: [],
      users: [],
      payments: [],
      subscribers: [],
      guestUsers: [],
      sellerProfiles: [],
      adminProfiles: [],
      listingImages: [],
      listingVideos: [],
      stories: INITIAL_STORIES,
      storyViews: [],
      favorites: [],
      searchHistory: [],
      notifications: [],
      subscriptions: [],
      reports: [],
      analytics: [],
      propertyTypes: INITIAL_PROPERTY_TYPES,
      amenities: INITIAL_AMENITIES,
      verificationRequests: [],
      phoneVerifications: [],
      activityLogs: [],
      auditLogs: []
    };
    
    this.save(defaultDB);
    this.cache = defaultDB;
    return defaultDB;
  }

  private save(db: AppDatabase) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
      this.cache = db;
    } catch (err) {
      console.error('Error writing JSON file db:', err);
    }
  }

  // Regions
  async getRegions(): Promise<Region[]> {
    return this.load().regions;
  }
  
  async createRegion(region: Region): Promise<Region> {
    const db = this.load();
    db.regions.push(region);
    this.save(db);
    return region;
  }

  // Districts
  async getDistricts(): Promise<District[]> {
    return this.load().districts;
  }
  
  async createDistrict(district: District): Promise<District> {
    const db = this.load();
    db.districts.push(district);
    this.save(db);
    return district;
  }

  // Listings
  async getListings(): Promise<Listing[]> {
    const db = this.load();
    // Dynamically reconstruct Listing images from normalized ListingImage table
    return db.listings.map(l => {
      const imgs = db.listingImages
        .filter(img => img.listingId === l.id)
        .sort((a, b) => a.order - b.order)
        .map(img => img.url);
      
      const vids = db.listingVideos.find(v => v.listingId === l.id);

      return {
        ...l,
        imageUrls: imgs.length > 0 ? imgs : l.imageUrls,
        videoUrl: vids ? vids.url : l.videoUrl
      };
    });
  }
  
  async getListingById(id: string): Promise<Listing | null> {
    const db = this.load();
    const l = db.listings.find(item => item.id === id);
    if (!l) return null;

    const imgs = db.listingImages
      .filter(img => img.listingId === l.id)
      .sort((a, b) => a.order - b.order)
      .map(img => img.url);
    
    const vids = db.listingVideos.find(v => v.listingId === l.id);

    return {
      ...l,
      imageUrls: imgs.length > 0 ? imgs : l.imageUrls,
      videoUrl: vids ? vids.url : l.videoUrl
    };
  }
  
  async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'reportsCount' | 'rating'>): Promise<Listing> {
    const db = this.load();
    const listingId = `listing-${Date.now()}`;
    
    const newListing: Listing = {
      id: listingId,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      reportsCount: 0,
      rating: 4.5,
      status: listingData.status || 'pending',
      currency: listingData.currency || 'USD',
      isNegotiable: listingData.isNegotiable !== undefined ? listingData.isNegotiable : true,
      isVIP: listingData.isVIP || listingData.plan === 'vip' || false,
      isPremium: listingData.isPremium || listingData.plan === 'premium' || false,
      isFeatured: listingData.isFeatured || false,
      isUrgent: listingData.isUrgent || false,
      favoritesCount: 0,
      sharesCount: 0,
      ...listingData
    };

    // Save in core listings table
    db.listings.push(newListing);

    // Save images in normalized listingImages table
    if (listingData.imageUrls && Array.isArray(listingData.imageUrls)) {
      listingData.imageUrls.forEach((url, idx) => {
        db.listingImages.push({
          id: `img-${listingId}-${idx}-${Date.now()}`,
          listingId: listingId,
          url: url,
          order: idx,
          isThumbnail: idx === 0,
          compressedUrl: url
        });
      });
    }

    // Save video in normalized listingVideos table
    if (listingData.videoUrl) {
      db.listingVideos.push({
        id: `vid-${listingId}-${Date.now()}`,
        listingId: listingId,
        url: listingData.videoUrl,
        provider: 'local'
      });
    }

    // Update activeListingsCount in SellerProfile
    const seller = db.sellerProfiles.find(s => s.userId === newListing.ownerTelegram || s.userId === newListing.ownerName);
    if (seller) {
      seller.activeListingsCount++;
    }

    this.save(db);
    return newListing;
  }
  
  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const db = this.load();
    const idx = db.listings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Listing ${id} not found`);

    // Merge updates
    const currentListing = db.listings[idx];
    const updatedListing = { 
      ...currentListing, 
      ...updates,
      updatedAt: new Date().toISOString() 
    };
    db.listings[idx] = updatedListing;

    // Sync Images if imageUrls are updated
    if (updates.imageUrls) {
      // Remove old image records for this listing
      db.listingImages = db.listingImages.filter(img => img.listingId !== id);
      // Create new ones
      updates.imageUrls.forEach((url, imageIndex) => {
        db.listingImages.push({
          id: `img-${id}-${imageIndex}-${Date.now()}`,
          listingId: id,
          url: url,
          order: imageIndex,
          isThumbnail: imageIndex === 0,
          compressedUrl: url
        });
      });
    }

    // Sync Videos if videoUrl is updated
    if (updates.hasOwnProperty('videoUrl')) {
      db.listingVideos = db.listingVideos.filter(v => v.listingId !== id);
      if (updates.videoUrl) {
        db.listingVideos.push({
          id: `vid-${id}-${Date.now()}`,
          listingId: id,
          url: updates.videoUrl,
          provider: 'local'
        });
      }
    }

    this.save(db);
    return updatedListing;
  }
  
  async deleteListing(id: string): Promise<boolean> {
    const db = this.load();
    const initialLen = db.listings.length;
    
    // Find the owner to update activeListingsCount
    const listing = db.listings.find(l => l.id === id);
    if (listing) {
      const seller = db.sellerProfiles.find(s => s.userId === listing.ownerTelegram || s.userId === listing.ownerName);
      if (seller && seller.activeListingsCount > 0) {
        seller.activeListingsCount--;
      }
    }

    db.listings = db.listings.filter(l => l.id !== id);
    
    // Cascade Delete
    db.listingImages = db.listingImages.filter(img => img.listingId !== id);
    db.listingVideos = db.listingVideos.filter(v => v.listingId !== id);
    db.favorites = db.favorites.filter(f => f.listingId !== id);
    db.reports = db.reports.filter(r => r.listingId !== id);

    this.save(db);
    return db.listings.length < initialLen;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.load().users;
  }
  
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    const user = this.load().users.find(u => u.telegramId === telegramId);
    return user || null;
  }
  
  async createUser(userData: Omit<User, 'id' | 'joinedDate'>): Promise<User> {
    const db = this.load();
    const existingIdx = db.users.findIndex(u => u.telegramId === userData.telegramId);
    
    if (existingIdx !== -1) {
      db.users[existingIdx] = { 
        ...db.users[existingIdx], 
        ...userData,
        phone_verified: userData.phone_verified || db.users[existingIdx].phone_verified || false,
        isVerifiedSeller: userData.isVerifiedSeller || db.users[existingIdx].isVerifiedSeller || false,
        isRegistered: userData.isRegistered || db.users[existingIdx].isRegistered || false
      };
      this.save(db);
      return db.users[existingIdx];
    }

    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      joinedDate: new Date().toISOString(),
      ...userData
    };
    db.users.push(newUser);

    // Create dual SellerProfile record automatically for normalization
    db.sellerProfiles.push({
      id: `seller-${userId}`,
      userId: userId,
      bio: `I am a seller in SaraUylar platform.`,
      rating: 4.5,
      joinedDate: new Date().toISOString(),
      verificationStatus: 'unverified',
      activeListingsCount: 0,
      soldListingsCount: 0,
      responseTime: "15 daqiqa",
      isPremium: false,
      isVIP: false
    });

    this.save(db);
    return newUser;
  }
  
  async updateUser(telegramId: string, updates: Partial<User>): Promise<User> {
    const db = this.load();
    const idx = db.users.findIndex(u => u.telegramId === telegramId);
    if (idx === -1) throw new Error(`User with telegram ID ${telegramId} not found`);
    
    const currentUser = db.users[idx];
    const updatedUser = { ...currentUser, ...updates };
    db.users[idx] = updatedUser;

    // Keep SellerProfile in sync
    const sellerIdx = db.sellerProfiles.findIndex(s => s.userId === currentUser.id);
    if (sellerIdx !== -1) {
      db.sellerProfiles[sellerIdx].isPremium = updatedUser.packageId === 'premium' || updatedUser.packageId === 'vip';
      db.sellerProfiles[sellerIdx].isVIP = updatedUser.packageId === 'vip';
      if (updatedUser.isVerifiedSeller !== undefined) {
        db.sellerProfiles[sellerIdx].verificationStatus = updatedUser.isVerifiedSeller ? 'verified' : 'unverified';
      }
    }

    this.save(db);
    return updatedUser;
  }

  // Seller Profiles
  async getSellerProfiles(): Promise<SellerProfile[]> {
    return this.load().sellerProfiles;
  }

  async getSellerProfileByUserId(userId: string): Promise<SellerProfile | null> {
    const profile = this.load().sellerProfiles.find(s => s.userId === userId);
    return profile || null;
  }

  async createSellerProfile(profileData: Omit<SellerProfile, 'id' | 'joinedDate'>): Promise<SellerProfile> {
    const db = this.load();
    const id = `seller-${Date.now()}`;
    const newProfile: SellerProfile = {
      id,
      joinedDate: new Date().toISOString(),
      ...profileData
    };
    db.sellerProfiles.push(newProfile);
    this.save(db);
    return newProfile;
  }

  async updateSellerProfile(userId: string, updates: Partial<SellerProfile>): Promise<SellerProfile> {
    const db = this.load();
    const idx = db.sellerProfiles.findIndex(s => s.userId === userId || s.id === userId);
    if (idx === -1) throw new Error(`SellerProfile for user ${userId} not found`);
    
    db.sellerProfiles[idx] = { ...db.sellerProfiles[idx], ...updates };
    this.save(db);
    return db.sellerProfiles[idx];
  }

  // Admin Profiles
  async getAdminProfiles(): Promise<AdminProfile[]> {
    return this.load().adminProfiles;
  }

  async getAdminProfileByUserId(userId: string): Promise<AdminProfile | null> {
    const profile = this.load().adminProfiles.find(a => a.userId === userId);
    return profile || null;
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return this.load().payments || [];
  }
  
  async createPayment(paymentData: Omit<Payment, 'id' | 'status' | 'createdAt'>): Promise<Payment> {
    const db = this.load();
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...paymentData
    };
    db.payments.push(newPayment);
    this.save(db);
    return newPayment;
  }
  
  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const db = this.load();
    const idx = db.payments.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`Payment ${id} not found`);
    db.payments[idx] = { ...db.payments[idx], ...updates };
    this.save(db);
    return db.payments[idx];
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    return this.load().inquiries;
  }
  
  async createInquiry(inquiryData: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<Inquiry> {
    const db = this.load();
    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      ...inquiryData
    };
    db.inquiries.push(newInquiry);
    this.save(db);
    return newInquiry;
  }
  
  async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry> {
    const db = this.load();
    const idx = db.inquiries.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Inquiry ${id} not found`);
    db.inquiries[idx] = { ...db.inquiries[idx], ...updates };
    this.save(db);
    return db.inquiries[idx];
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return this.load().reviews;
  }
  
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const db = this.load();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'approved',
      ...reviewData
    };
    db.reviews.push(newReview);
    
    // Recalculate SellerProfile or listing ratings
    if (reviewData.sellerId) {
      const sellerReviews = db.reviews.filter(r => r.sellerId === reviewData.sellerId && r.status !== 'rejected');
      const avg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / (sellerReviews.length || 1);
      const sellerIdx = db.sellerProfiles.findIndex(s => s.userId === reviewData.sellerId);
      if (sellerIdx !== -1) {
        db.sellerProfiles[sellerIdx].rating = parseFloat(avg.toFixed(1));
      }
    }

    this.save(db);
    return newReview;
  }

  async updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<Review> {
    const db = this.load();
    const idx = db.reviews.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Review ${id} not found`);
    db.reviews[idx].status = status;
    this.save(db);
    return db.reviews[idx];
  }

  // Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.load().plans;
  }
  
  async createPlan(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    const db = this.load();
    db.plans.push(plan);
    this.save(db);
    return plan;
  }
  
  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const db = this.load();
    const idx = db.plans.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`Plan ${id} not found`);
    db.plans[idx] = { ...db.plans[idx], ...updates };
    this.save(db);
    return db.plans[idx];
  }

  // Subscription History
  async getSubscriptionHistory(): Promise<SubscriptionHistoryItem[]> {
    return this.load().subscriptionHistory;
  }
  
  async createSubscriptionHistoryItem(itemData: Omit<SubscriptionHistoryItem, 'id'>): Promise<SubscriptionHistoryItem> {
    const db = this.load();
    const newItem: SubscriptionHistoryItem = {
      id: `sub-hist-${Date.now()}`,
      ...itemData
    };
    db.subscriptionHistory.push(newItem);
    this.save(db);
    return newItem;
  }

  // Subscriptions (Scalable)
  async getSubscriptions(): Promise<Subscription[]> {
    return this.load().subscriptions || [];
  }

  async createSubscription(subData: Omit<Subscription, 'id'>): Promise<Subscription> {
    const db = this.load();
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      ...subData
    };
    db.subscriptions.push(newSub);
    this.save(db);
    return newSub;
  }

  // Subscribers
  async getSubscribers(): Promise<number[]> {
    return this.load().subscribers || [];
  }
  
  async addSubscriber(chatId: number): Promise<boolean> {
    const db = this.load();
    if (db.subscribers.includes(chatId)) return false;
    db.subscribers.push(chatId);
    this.save(db);
    return true;
  }
  
  async removeSubscriber(chatId: number): Promise<boolean> {
    const db = this.load();
    const idx = db.subscribers.indexOf(chatId);
    if (idx === -1) return false;
    db.subscribers.splice(idx, 1);
    this.save(db);
    return true;
  }

  // Stories
  async getStories(): Promise<Story[]> {
    return this.load().stories || [];
  }

  async createStory(storyData: Omit<Story, 'id' | 'createdAt'>): Promise<Story> {
    const db = this.load();
    const newStory: Story = {
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      ...storyData
    };
    db.stories.push(newStory);
    this.save(db);
    return newStory;
  }

  async incrementStoryViews(storyId: string, userId?: string, guestId?: string): Promise<void> {
    const db = this.load();
    const story = db.stories.find(s => s.id === storyId);
    if (story) {
      story.viewsCount = (story.viewsCount || 0) + 1;
      
      // Save view record for analytics
      db.storyViews.push({
        id: `view-${Date.now()}`,
        storyId,
        userId,
        guestId,
        viewedAt: new Date().toISOString()
      });
      
      this.save(db);
    }
  }

  // Favorites (Scalable)
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    const db = this.load();
    return db.favorites.filter(f => f.userId === userId);
  }

  async toggleFavorite(userId: string, listingId: string): Promise<boolean> {
    const db = this.load();
    const idx = db.favorites.findIndex(f => f.userId === userId && f.listingId === listingId);
    let added = false;
    
    if (idx !== -1) {
      db.favorites.splice(idx, 1);
    } else {
      db.favorites.push({
        id: `fav-${Date.now()}`,
        userId,
        listingId,
        createdAt: new Date().toISOString()
      });
      added = true;
    }

    // Sync listings stats
    const listing = db.listings.find(l => l.id === listingId);
    if (listing) {
      listing.favoritesCount = db.favorites.filter(f => f.listingId === listingId).length;
    }

    this.save(db);
    return added;
  }

  // Search History
  async getSearchHistory(userId?: string, guestId?: string): Promise<SearchHistory[]> {
    const db = this.load();
    return db.searchHistory.filter(s => (userId && s.userId === userId) || (guestId && s.guestId === guestId));
  }

  async addSearchQuery(query: string, filters?: any, userId?: string, guestId?: string): Promise<SearchHistory> {
    const db = this.load();
    const record: SearchHistory = {
      id: `search-${Date.now()}`,
      userId,
      guestId,
      query,
      filters: filters ? JSON.stringify(filters) : undefined,
      createdAt: new Date().toISOString()
    };
    db.searchHistory.push(record);
    this.save(db);
    return record;
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return this.load().reports || [];
  }

  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> {
    const db = this.load();
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...reportData
    };
    db.reports.push(newReport);
    
    // Update count in listing
    const listing = db.listings.find(l => l.id === reportData.listingId);
    if (listing) {
      listing.reportsCount = (listing.reportsCount || 0) + 1;
    }

    this.save(db);
    return newReport;
  }

  async updateReportStatus(id: string, status: 'reviewed' | 'resolved', adminNotes?: string): Promise<Report> {
    const db = this.load();
    const idx = db.reports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Report ${id} not found`);
    db.reports[idx].status = status;
    if (adminNotes) db.reports[idx].adminNotes = adminNotes;
    this.save(db);
    return db.reports[idx];
  }

  // Analytics
  async getAnalytics(): Promise<Analytics[]> {
    return this.load().analytics || [];
  }

  async logEvent(eventType: Analytics['eventType'], userId?: string, guestId?: string, listingId?: string, metadata?: any): Promise<Analytics> {
    const db = this.load();
    const record: Analytics = {
      id: `an-${Date.now()}`,
      eventType,
      userId,
      guestId,
      listingId,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      createdAt: new Date().toISOString()
    };
    db.analytics.push(record);
    
    // Increment count on listing if applicable
    if (listingId) {
      const listing = db.listings.find(l => l.id === listingId);
      if (listing) {
        if (eventType === 'view') {
          listing.viewsCount++;
        } else if (eventType === 'share') {
          listing.sharesCount = (listing.sharesCount || 0) + 1;
        }
      }
    }

    this.save(db);
    return record;
  }

  // Amenities & Property Types
  async getAmenities(): Promise<Amenity[]> {
    return this.load().amenities || INITIAL_AMENITIES;
  }

  async getPropertyTypes(): Promise<PropertyTypeEntity[]> {
    return this.load().propertyTypes || INITIAL_PROPERTY_TYPES;
  }

  // Phone Verification System
  async getPhoneVerifications(): Promise<PhoneVerification[]> {
    return this.load().phoneVerifications || [];
  }

  async createPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification> {
    const db = this.load();
    const record: PhoneVerification = {
      id: `pv-${Date.now()}`,
      phoneNumber,
      code,
      isVerified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      createdAt: new Date().toISOString()
    };
    db.phoneVerifications.push(record);
    this.save(db);
    return record;
  }

  async verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean> {
    const db = this.load();
    const records = db.phoneVerifications.filter(v => v.phoneNumber === phoneNumber && v.code === code && !v.isVerified);
    if (records.length === 0) return false;
    
    const active = records.find(r => new Date(r.expiresAt).getTime() > Date.now());
    if (!active) return false;

    active.isVerified = true;
    
    // Also update any user with this phone number to be verified
    const user = db.users.find(u => u.phoneNumber === phoneNumber);
    if (user) {
      user.phone_verified = true;
      user.isVerifiedSeller = true;
      
      const seller = db.sellerProfiles.find(s => s.userId === user.id);
      if (seller) {
        seller.verificationStatus = 'verified';
      }
    }

    this.save(db);
    return true;
  }

  // Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.load().activityLogs || [];
  }

  async logActivity(action: string, userId?: string, guestId?: string, ipAddress?: string, userAgent?: string): Promise<ActivityLog> {
    const db = this.load();
    const log: ActivityLog = {
      id: `act-log-${Date.now()}`,
      userId,
      guestId,
      action,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString()
    };
    db.activityLogs.push(log);
    this.save(db);
    return log;
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return this.load().auditLogs || [];
  }

  async logAudit(adminUserId: string, action: string, entityName: string, entityId: string, previousState?: any, newState?: any): Promise<AuditLog> {
    const db = this.load();
    const log: AuditLog = {
      id: `aud-log-${Date.now()}`,
      adminUserId,
      action,
      entityName,
      entityId,
      previousState: previousState ? JSON.stringify(previousState) : undefined,
      newState: newState ? JSON.stringify(newState) : undefined,
      createdAt: new Date().toISOString()
    };
    db.auditLogs.push(log);
    this.save(db);
    return log;
  }

  // System Reset
  async resetSystem(): Promise<boolean> {
    const defaultDB: AppDatabase = {
      regions: INITIAL_REGIONS,
      districts: INITIAL_DISTRICTS,
      listings: [],
      inquiries: [],
      reviews: [],
      plans: INITIAL_PLANS,
      subscriptionHistory: [],
      users: [],
      payments: [],
      subscribers: [],
      guestUsers: [],
      sellerProfiles: [],
      adminProfiles: [],
      listingImages: [],
      listingVideos: [],
      stories: INITIAL_STORIES,
      storyViews: [],
      favorites: [],
      searchHistory: [],
      notifications: [],
      subscriptions: [],
      reports: [],
      analytics: [],
      propertyTypes: INITIAL_PROPERTY_TYPES,
      amenities: INITIAL_AMENITIES,
      verificationRequests: [],
      phoneVerifications: [],
      activityLogs: [],
      auditLogs: []
    };
    this.save(defaultDB);
    return true;
  }
}

// Export a single instance of the database repository
export const dbRepository: IDatabaseRepository = new JsonFileRepository();
