/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Listing, Inquiry, Review, Notification, Region, District, SubscriptionPlan, SubscriptionHistoryItem, SubscriptionTier } from './types';
import { 
  INITIAL_REGIONS, 
  INITIAL_DISTRICTS, 
  INITIAL_HOUSES, 
  INITIAL_REVIEWS 
} from './initialData';
import MiniApp from './components/MiniApp';
import AdminPanel from './components/AdminPanel';
import SaraUylarLogo from './components/SaraUylarLogo';
import { 
  ShieldCheck, LayoutDashboard, Globe, RefreshCw, X, Lock, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_IDS = [
  8638170982, // DB Subscriber ID (System Admin)
  123456789,
  987654321
];

export default function App() {
  // --- 1. CORE STATE MANAGEMENT ---
  const [regions, setRegions] = useState<Region[]>(() => {
    const local = localStorage.getItem('sara_regions');
    return local ? JSON.parse(local) : INITIAL_REGIONS;
  });

  const [districts, setDistricts] = useState<District[]>(() => {
    const local = localStorage.getItem('sara_districts');
    return local ? JSON.parse(local) : INITIAL_DISTRICTS;
  });

  const [listings, setListings] = useState<Listing[]>(() => {
    const local = localStorage.getItem('sara_listings');
    const raw = local ? JSON.parse(local) : INITIAL_HOUSES;
    return raw.map((l: any) => {
      let defaultPlan: SubscriptionTier = 'standard';
      let defaultExpires: string | undefined = undefined;
      
      if (l.plan) {
        defaultPlan = l.plan;
        defaultExpires = l.planExpiresAt;
      } else if (l.isPremium) {
        if (l.id === 'listing-1') {
          defaultPlan = 'vip';
        } else if (l.id === 'listing-2') {
          defaultPlan = 'premium';
        } else if (l.id === 'listing-4') {
          defaultPlan = 'vip';
        } else {
          defaultPlan = 'premium';
        }
        defaultExpires = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      return {
        ...l,
        plan: defaultPlan,
        planExpiresAt: defaultExpires
      };
    });
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const local = localStorage.getItem('sara_plans');
    return local ? JSON.parse(local) : [
      { id: 'vip', name: 'VIP', price: 99, durationDays: 30, badge: '🥇 VIP' },
      { id: 'premium', name: 'Premium', price: 49, durationDays: 30, badge: '🥈 Premium' },
      { id: 'standard', name: 'Standard', price: 0, durationDays: 30, badge: '🥉 Standard' }
    ];
  });

  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>(() => {
    const local = localStorage.getItem('sara_subscription_history');
    return local ? JSON.parse(local) : [
      {
        id: 'sub-hist-1',
        listingId: 'listing-1',
        listingTitle: 'Mirobod tumani, Oybek metrosi yaqinida 3 xonali premium kvartira',
        planId: 'vip',
        startDate: '2026-06-25T12:00:00Z',
        endDate: '2026-07-25T12:00:00Z',
        status: 'active',
        pricePaid: 99
      },
      {
        id: 'sub-hist-2',
        listingId: 'listing-2',
        listingTitle: 'Yunusobodda 6 sotixli 5 xonali zamonaviy hovli / evrodom',
        planId: 'premium',
        startDate: '2026-07-01T15:30:00Z',
        endDate: '2026-07-31T15:30:00Z',
        status: 'active',
        pricePaid: 49
      }
    ];
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const local = localStorage.getItem('sara_inquiries');
    return local ? JSON.parse(local) : [
      {
        id: 'inq-998',
        listingId: 'listing-1',
        userId: '@farrukh_alimov',
        userName: 'Farrukh Alimov',
        userPhone: '+998 90 321 00 99',
        contactType: 'telegram',
        message: 'Assalomu alaykum, ushbu Oybek metrosidagi kvartirani borib ko\'rish imkoni bormi? Kadastr hujjatlari tayyormi?',
        status: 'new',
        createdAt: '2026-07-06T09:00:00Z'
      }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const local = localStorage.getItem('sara_reviews');
    return local ? JSON.parse(local) : INITIAL_REVIEWS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const local = localStorage.getItem('sara_favorites');
    return local ? JSON.parse(local) : ['listing-1', 'listing-4'];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeAlert, setActiveAlert] = useState<Notification | null>(null);

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);

  // Dynamic Bot Username State
  const [botUsername, setBotUsername] = useState<string>('SaraUylarBot');

  // --- REAL TELEGRAM AUTHENTICATION & SECURITY STATE ---
  const [users, setUsers] = useState<any[]>([]);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false); // Controls whether the Admin dashboard is displayed or the MiniApp preview is displayed for admins
  const [authLoading, setAuthLoading] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  // Bridge state: when deep link params are found, pre-fill filters
  const [passedFilters, setPassedFilters] = useState<any | null>(null);

  // Helper to get initial user state synchronously so the app loads instantly
  const getInitialUser = () => {
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    
    if (tgUser) {
      const tgUserId = String(tgUser.id);
      const tgUsername = tgUser.username ? `@${tgUser.username}` : `@id${tgUser.id}`;
      const tgFullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Telegram User';
      const tgAvatar = tgUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tgUser.first_name || 'User')}&background=0082D5&color=fff`;
      
      return {
        id: `tg-${tgUserId}`,
        telegramId: tgUserId,
        username: tgUsername,
        fullName: tgFullName,
        phoneNumber: '',
        avatarUrl: tgAvatar,
        isRegistered: false,
        isVerifiedSeller: false,
        packageId: 'standard' as const,
        packageExpiresAt: '',
        listingsCreatedCount: 0,
        joinedDate: new Date().toISOString(),
        firstName: tgUser.first_name || '',
        lastName: tgUser.last_name || '',
        isTelegramPremium: !!tgUser.is_premium,
        languageCode: tgUser.language_code || 'uz'
      };
    }
    
    return {
      id: 'guest',
      telegramId: '',
      username: '',
      fullName: 'Guest',
      phoneNumber: '',
      avatarUrl: 'https://ui-avatars.com/api/?name=Guest&background=0082D5&color=fff',
      isRegistered: false,
      isVerifiedSeller: false,
      packageId: 'standard' as const,
      packageExpiresAt: '',
      listingsCreatedCount: 0,
      joinedDate: new Date().toISOString()
    };
  };

  // Synchronously initialize the current user as a Guest
  const [currentUser, setCurrentUser] = useState<any>(getInitialUser);

  const [isAdminDomain] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return window.location.hostname === 'admin.sarauylar.uz' ||
           window.location.hostname.startsWith('admin.') ||
           params.get('admin') === 'true';
  });

  // Fetch Bot Username Dynamically to keep all deep links 100% correct
  useEffect(() => {
    fetch('/api/bot-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'connected' && data.botInfo?.username) {
          console.log(`[CLIENT LOG] Dynamically loaded Telegram bot username: @${data.botInfo.username}`);
          setBotUsername(data.botInfo.username);
        }
      })
      .catch(err => console.warn("[CLIENT LOG] Failed to fetch bot username dynamically:", err));
  }, []);

  // Parse Telegram WebApp SDK Data, URL Query Params and register/retrieve DB user
  useEffect(() => {
    const initUser = async () => {
      const tg = (window as any).Telegram?.WebApp;

      // Initialize Telegram immediately when the Mini App opens
      if (tg) {
        tg.ready();
        tg.expand();
      }

      const initData = tg?.initData;
      const params = new URLSearchParams(window.location.search);
      const tgUser = tg?.initDataUnsafe?.user;

      if (tgUser) {
        console.log("Telegram detected:", true);
        const tgUserId = String(tgUser.id);

        const isUserAdmin = ADMIN_IDS.includes(Number(tgUserId));
        if (isAdminDomain) {
          if (isUserAdmin) {
            setIsAdmin(true);
            setAdminMode(true);
            setIsAdminAuthorized(true);
          } else {
            setIsAdmin(false);
            setAdminMode(false);
            setIsAdminAuthorized(false);
          }
        } else {
          setIsAdmin(false);
          setAdminMode(false);
          setIsAdminAuthorized(true);
        }

        // 3. Send initData to the backend asynchronously (Background verification)
        fetch('/api/auth/verify-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        })
        .then(async (verifyRes) => {
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.user) {
              console.log("verification result:", "success");
              // Keep the session and update with complete backend state
              setCurrentUser(verifyData.user);

              // Update admin state
              const isVerifiedAdmin = ADMIN_IDS.includes(Number(verifyData.user.telegramId));
              if (isAdminDomain) {
                if (isVerifiedAdmin) {
                  setIsAdmin(true);
                  setAdminMode(true);
                  setIsAdminAuthorized(true);
                } else {
                  setIsAdmin(false);
                  setAdminMode(false);
                  setIsAdminAuthorized(false);
                }
              } else {
                setIsAdmin(false);
                setAdminMode(false);
                setIsAdminAuthorized(true);
              }
            } else {
              console.log("verification result: failed (non-blocking fallback for guest)");
              if (isAdminDomain) {
                setIsAdminAuthorized(false);
              }
            }
          } else {
            console.log("verification status check failed (non-blocking fallback for guest)");
            if (isAdminDomain) {
              setIsAdminAuthorized(false);
            }
          }
        })
        .catch((err) => {
          console.warn("Background verification error, using fallback local Guest session:", err);
          if (isAdminDomain) {
            setIsAdminAuthorized(false);
          }
        });

      } else {
        // No Telegram user detected
        console.log("Telegram detected:", false);

        if (isAdminDomain) {
          const devAdminUser = {
            id: 'admin-1',
            telegramId: '8638170982', // DB Subscriber ID (System Admin)
            username: '@sara_admin',
            fullName: 'Sara Admin',
            phoneNumber: '+998 90 999 00 00',
            avatarUrl: 'https://ui-avatars.com/api/?name=Sara+Admin&background=0082D5&color=fff',
            isRegistered: true,
            isVerifiedSeller: true,
            packageId: 'vip' as const,
            packageExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            listingsCreatedCount: 2,
            joinedDate: new Date().toISOString(),
            firstName: 'Sara',
            lastName: 'Admin',
            isTelegramPremium: true,
            languageCode: 'uz'
          };
          setCurrentUser(devAdminUser);
          setIsAdmin(true);
          setAdminMode(true);
          setIsAdminAuthorized(true);
          setAuthFailed(false);
        } else {
          // Dev normal user fallback as Guest
          const devNormalUser = getInitialUser();
          setCurrentUser(devNormalUser);
          setIsAdmin(false);
          setAdminMode(false);
          setIsAdminAuthorized(true);
          setAuthFailed(false);
        }
      }

      // Parse deep links (e.g. ?dealType=sale&rooms=3)
      const dealType = params.get('dealType');
      const propertyType = params.get('propertyType');
      const regionId = params.get('regionId');
      const districtId = params.get('districtId');
      const rooms = params.get('rooms');

      if (dealType || propertyType || regionId || districtId || rooms) {
        setPassedFilters({
          dealType: dealType || undefined,
          propertyType: propertyType || undefined,
          regionId: regionId || undefined,
          districtId: districtId || undefined,
          rooms: rooms ? parseInt(rooms) : undefined,
          additionalFilters: []
        });
      }
    };

    initUser();
  }, []);

  // --- 1.5 FULL-STACK SERVER DATA SYNCHRONIZATION ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resListings, resInquiries, resReviews, resPlans, resHistory, resRegions, resDistricts, resPayments, resUsers] = await Promise.all([
          fetch('/api/listings').then(r => r.json()),
          fetch('/api/inquiries').then(r => r.json()),
          fetch('/api/reviews').then(r => r.json()),
          fetch('/api/plans').then(r => r.json()),
          fetch('/api/subscription-history').then(r => r.json()),
          fetch('/api/regions').then(r => r.json()),
          fetch('/api/districts').then(r => r.json()),
          fetch('/api/payments').then(r => r.json()).catch(() => []),
          fetch('/api/users').then(r => r.json()).catch(() => [])
        ]);

        if (resListings && Array.isArray(resListings)) setListings(resListings);
        if (resInquiries && Array.isArray(resInquiries)) setInquiries(resInquiries);
        if (resReviews && Array.isArray(resReviews)) setReviews(resReviews);
        if (resPlans && Array.isArray(resPlans)) setPlans(resPlans);
        if (resHistory && Array.isArray(resHistory)) setSubscriptionHistory(resHistory);
        if (resRegions && Array.isArray(resRegions)) setRegions(resRegions);
        if (resDistricts && Array.isArray(resDistricts)) setDistricts(resDistricts);
        if (resPayments && Array.isArray(resPayments)) setPayments(resPayments);
        if (resUsers && Array.isArray(resUsers)) setUsers(resUsers);
      } catch (err) {
        console.warn("Backend API loading failed or not running, falling back to LocalStorage.", err);
      }
    };
    fetchAllData();

    // Background poll listings, inquiries, users and payments every 5s to sync live Telegram Bot actions
    const pollInterval = setInterval(async () => {
      try {
        const [resListings, resInquiries, resPayments, resUsers] = await Promise.all([
          fetch('/api/listings').then(r => r.json()),
          fetch('/api/inquiries').then(r => r.json()),
          fetch('/api/payments').then(r => r.json()).catch(() => []),
          fetch('/api/users').then(r => r.json()).catch(() => [])
        ]);
        if (resListings && Array.isArray(resListings)) setListings(resListings);
        if (resInquiries && Array.isArray(resInquiries)) setInquiries(resInquiries);
        if (resPayments && Array.isArray(resPayments)) setPayments(resPayments);
        if (resUsers && Array.isArray(resUsers)) setUsers(resUsers);
      } catch (err) {
        // Ignore poll failures
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // --- 2. LOCAL STORAGE EFFECT SYNC ---
  useEffect(() => {
    localStorage.setItem('sara_regions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('sara_districts', JSON.stringify(districts));
  }, [districts]);

  useEffect(() => {
    localStorage.setItem('sara_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('sara_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('sara_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sara_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sara_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('sara_subscription_history', JSON.stringify(subscriptionHistory));
  }, [subscriptionHistory]);

  useEffect(() => {
    localStorage.setItem('sara_payments', JSON.stringify(payments));
  }, [payments]);

  // Automatic expiration checker loop
  useEffect(() => {
    const checkExpirations = () => {
      let updated = false;
      const now = new Date();
      const updatedListings = listings.map(listing => {
        if (listing.plan !== 'standard' && listing.planExpiresAt) {
          const expiryDate = new Date(listing.planExpiresAt);
          if (now > expiryDate) {
            updated = true;
            triggerNotification(
              "Obuna muddati tugadi",
              `'${listing.title}' e'lonining ${listing.plan.toUpperCase()} obuna muddati tugadi va Standard darajaga qaytarildi.`,
              'system'
            );
            
            // Add to history
            const historyId = `sub-exp-${Date.now()}-${listing.id}`;
            setSubscriptionHistory(prev => [
              {
                id: historyId,
                listingId: listing.id,
                listingTitle: listing.title,
                planId: listing.plan || 'standard',
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: listing.planExpiresAt || new Date().toISOString(),
                status: 'expired',
                pricePaid: 0
              },
              ...prev
            ]);

            return {
              ...listing,
              plan: 'standard' as const,
              planExpiresAt: undefined,
              isPremium: false
            };
          }
        }
        return listing;
      });

      if (updated) {
        setListings(updatedListings);
      }
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 30000);
    return () => clearInterval(interval);
  }, [listings]);

  // --- 3. PLATFORM CORE ACTIONS ---
  
  const triggerNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveAlert(newNotif);
    
    // Play subtle audio cue if permitted
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio block ignore
    }

    setTimeout(() => {
      setActiveAlert(null);
    }, 5000);
  };

  // Add Listing (directly from Mini App tab!)
  const handleAddListing = async (newListingData: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'viewsCount' | 'reportsCount'>) => {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListingData)
      });
      if (res.ok) {
        const saved = await res.json();
        setListings(prev => [saved, ...prev]);
        triggerNotification(
          saved.status === 'approved' ? "E'lon Chop Etildi" : "Yangi E'lon Moderatsiyada",
          saved.status === 'approved' 
            ? `'${saved.title}' e'loni premium tarif bilan tasdiqlandi va darhol chop etildi!` 
            : `'${saved.title}' e'loni moderatsiya uchun muvaffaqiyatli qabul qilindi!`,
          'listing'
        );
        return saved;
      }
    } catch (err) {
      const newListing: Listing = {
        ...newListingData,
        id: `listing-${Date.now()}`,
        viewsCount: 1,
        reportsCount: 0,
        createdAt: new Date().toISOString(),
        rating: 5.0,
        status: newListingData.status || 'pending'
      };
      setListings(prev => [newListing, ...prev]);
      triggerNotification(
        "Yangi E'lon Moderatsiyada (Lokal)",
        `'${newListing.title}' e'loni yaratildi va moderatsiyaga yuborildi.`,
        'listing'
      );
      return newListing;
    }
  };

  // Mini App Inquiry Submission
  const handleAddInquiryFromMiniApp = async (newInquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiryData)
      });
      if (res.ok) {
        const saved = await res.json();
        setInquiries(prev => [saved, ...prev]);
        const targetListing = listings.find(l => l.id === saved.listingId);
        triggerNotification(
          "Yangi Aloqa So'rovi",
          `Mijoz ${saved.userName} bilan bog'lanish so'rovi muvaffaqiyatli qabul qilindi: "${targetListing?.title || 'E\'lon'}"`,
          'inquiry'
        );
      }
    } catch (err) {
      const newInquiry: Inquiry = {
        ...newInquiryData,
        id: `inq-${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toISOString(),
        status: 'new'
      };
      setInquiries(prev => [newInquiry, ...prev]);
      triggerNotification(
        "Yuborilgan Aloqa So'rovi (Lokal)",
        `Sotuvchiga so'rovingiz muvaffaqiyatli yuborildi!`,
        'inquiry'
      );
    }
  };

  // Client/Owner updates property
  const handleUpdateListing = async (id: string, updates: Partial<Listing>) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setListings(prev => prev.map(l => l.id === id ? updated : l));
        triggerNotification(
          "E'lon Yangilandi",
          `'${updated.title}' muvaffaqiyatli tahrirlandi.`,
          'listing'
        );
        return updated;
      }
    } catch (err) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      triggerNotification(
        "E'lon Yangilandi (Lokal)",
        "E'lon ma'lumotlari muvaffaqiyatli tahrirlandi.",
        'listing'
      );
    }
  };

  // Admin approves property
  const handleApproveListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (res.ok) {
        const updated = await res.json();
        setListings(prev => prev.map(l => l.id === id ? updated : l));
        triggerNotification(
          "E'lon Tasdiqlandi",
          `'${updated.title}' e'loni muvaffaqiyatli tasdiqlandi va e'longa chiqarildi!`,
          'system'
        );
      }
    } catch (err) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
      const target = listings.find(l => l.id === id);
      if (target) {
        triggerNotification(
          "E'lon Tasdiqlandi (Lokal)",
          `'${target.title}' e'loni muvaffaqiyatli tasdiqlandi!`,
          'system'
        );
      }
    }
  };

  // Admin rejects property
  const handleRejectListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        const updated = await res.json();
        setListings(prev => prev.map(l => l.id === id ? updated : l));
        triggerNotification(
          "E'lon Rad Etildi",
          `'${updated.title}' e'loni moderatsiyadan o'tmadi.`,
          'system'
        );
      }
    } catch (err) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
      const target = listings.find(l => l.id === id);
      if (target) {
        triggerNotification(
          "E'lon Rad Etildi (Lokal)",
          `'${target.title}' e'loni rad etildi.`,
          'system'
        );
      }
    }
  };

  // Admin deletes property
  const handleDeleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id));
        triggerNotification(
          "E'lon O'chirildi",
          `E'lon tizimdan butunlay o'chirib tashlandi.`,
          'system'
        );
      }
    } catch (err) {
      setListings(prev => prev.filter(l => l.id !== id));
      triggerNotification(
        "E'lon O'chirildi (Lokal)",
        `E'lon tizimdan o'chirildi.`,
        'system'
      );
    }
  };

  // Admin marks property as Premium
  const handleTogglePremiumListing = async (id: string) => {
    const target = listings.find(l => l.id === id);
    if (!target) return;
    const nextPremium = !target.isPremium;

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: nextPremium })
      });
      if (res.ok) {
        const updated = await res.json();
        setListings(prev => prev.map(l => l.id === id ? updated : l));
        triggerNotification(
          updated.isPremium ? "Premiumga O'tkazildi" : "Premium Bekor Qilindi",
          `'${updated.title}' premium holati o'zgartirildi.`,
          'system'
        );
      }
    } catch (err) {
      setListings(prev => prev.map(l => l.id === id ? { ...l, isPremium: nextPremium } : l));
      triggerNotification(
        nextPremium ? "Premiumga O'tkazildi (Lokal)" : "Premium Bekor Qilindi (Lokal)",
        `'${target.title}' premium holati o'zgartirildi.`,
        'system'
      );
    }
  };

  // Admin processes contact inquiry
  const handleProcessInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processed' })
      });
      if (res.ok) {
        const updated = await res.json();
        setInquiries(prev => prev.map(inq => inq.id === id ? updated : inq));
        triggerNotification(
          "So'rov Bajarildi!",
          `Mijoz ${updated.userName} ning so'rovi tasdiqlangan deb belgilandi.`,
          'inquiry'
        );
      }
    } catch (err) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'processed' } : inq));
      const inqObj = inquiries.find(inq => inq.id === id);
      if (inqObj) {
        triggerNotification(
          "So'rov Bajarildi! (Lokal)",
          `Mijoz ${inqObj.userName} ning so'rovi ko'rib chiqildi deb belgilandi.`,
          'inquiry'
        );
      }
    }
  };

  // Admin archives inquiry
  const handleArchiveInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      if (res.ok) {
        const updated = await res.json();
        setInquiries(prev => prev.map(inq => inq.id === id ? updated : inq));
        triggerNotification(
          "So'rov Arxivlandi",
          `Aloqa so'rovi muvaffaqiyatli arxivga joylandi.`,
          'inquiry'
        );
      }
    } catch (err) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'archived' } : inq));
      triggerNotification(
        "So'rov Arxivlandi (Lokal)",
        `Aloqa so'rovi arxivga ko'chirildi.`,
        'inquiry'
      );
    }
  };

  // Admin triggers global message push
  const handleBroadcastMessage = async (title: string, message: string) => {
    try {
      await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${title}\n\n${message}` })
      });
      triggerNotification(
        `Telegram Broadcast: ${title}`,
        "Telegram bot obunachilariga xabar jo'natildi!",
        'broadcast'
      );
    } catch (err) {
      triggerNotification(
        `Broadcast (Lokal): ${title}`,
        message,
        'broadcast'
      );
    }
  };

  // Favorites toggle
  const handleToggleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(listingId);
      if (exists) {
        triggerNotification("Sevimlilardan o'chirildi", "E'lon saqlangan ro'yxatingizdan olib tashlandi.", "system");
        return prev.filter(id => id !== listingId);
      } else {
        triggerNotification("Sevimlilarga qo'shildi", "E'lon muvaffaqiyatli saqlandi!", "system");
        return [...prev, listingId];
      }
    });
  };

  // Config triggers
  const handleAddRegion = async (name: string) => {
    try {
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const saved = await res.json();
        setRegions(prev => [...prev, saved]);
        triggerNotification("Yangi Viloyat", `'${saved.name}' muvaffaqiyatli qo'shildi.`, 'system');
      }
    } catch (err) {
      const newReg: Region = {
        id: `reg-${Date.now()}`,
        name
      };
      setRegions(prev => [...prev, newReg]);
      triggerNotification("Yangi Viloyat (Lokal)", `'${name}' kiritildi.`, 'system');
    }
  };

  const handleAddDistrict = async (regionId: string, name: string) => {
    try {
      const res = await fetch('/api/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, regionId })
      });
      if (res.ok) {
        const saved = await res.json();
        setDistricts(prev => [...prev, saved]);
        triggerNotification("Yangi Hudud", `'${saved.name}' muvaffaqiyatli kiritildi.`, 'system');
      }
    } catch (err) {
      const newDist: District = {
        id: `dist-${Date.now()}`,
        regionId,
        name
      };
      setDistricts(prev => [...prev, newDist]);
      triggerNotification("Yangi Hudud (Lokal)", `'${name}' kiritildi.`, 'system');
    }
  };

  const handleEditPlanPrice = async (planId: SubscriptionTier, newPrice: number) => {
    try {
      const res = await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      if (res.ok) {
        const updated = await res.json();
        setPlans(prev => prev.map(p => p.id === planId ? updated : p));
        triggerNotification(
          "Tarif narxi o'zgartirildi",
          `${planId.toUpperCase()} tarifi narxi $${newPrice} qilib belgilandi.`,
          'system'
        );
      }
    } catch (err) {
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, price: newPrice } : p));
      triggerNotification(
        "Tarif o'zgartirildi (Lokal)",
        `${planId.toUpperCase()} tarifi narxi $${newPrice} qilib belgilandi.`,
        'system'
      );
    }
  };

  const handleCreatePlan = async (name: string, price: number, durationDays: number, badge: string) => {
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, durationDays, badge })
      });
      if (res.ok) {
        const saved = await res.json();
        setPlans(prev => [...prev, saved]);
        triggerNotification(
          "Yangi obuna tarifi",
          `'${name}' yangi tarifi yaratildi!`,
          'system'
        );
      }
    } catch (err) {
      const id = name.toLowerCase().replace(/\s+/g, '-') as any;
      const newPlan: SubscriptionPlan = { id, name, price, durationDays, badge };
      setPlans(prev => [...prev, newPlan]);
      triggerNotification(
        "Yangi tarif (Lokal)",
        `'${name}' yangi tarifi yaratildi!`,
        'system'
      );
    }
  };

  const handleActivateSubscription = async (listingId: string, planId: SubscriptionTier) => {
    const planObj = plans.find(p => p.id === planId);
    const price = planObj ? planObj.price : 0;
    const durationDays = planObj ? planObj.durationDays : 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const target = listings.find(l => l.id === listingId);
    const historyId = `sub-act-${Date.now()}`;
    const newSub: SubscriptionHistoryItem = {
      id: historyId,
      listingId,
      listingTitle: target ? target.title : "Noma'lum e'lon",
      planId,
      startDate: new Date().toISOString(),
      endDate: expiresAt,
      status: 'active',
      pricePaid: price
    };

    try {
      await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          planExpiresAt: expiresAt,
          isPremium: planId === 'premium' || planId === 'vip'
        })
      });
      await fetch('/api/subscription-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      });
    } catch (err) {
      console.warn("API subscription activation failed, updating local state", err);
    }

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return {
          ...l,
          plan: planId,
          planExpiresAt: expiresAt,
          isPremium: planId === 'premium' || planId === 'vip'
        };
      }
      return l;
    }));
    setSubscriptionHistory(prev => [newSub, ...prev]);

    triggerNotification(
      "Obuna faollashtirildi",
      `Mulk uchun ${planId.toUpperCase()} obunasi faollashtirildi (${durationDays} kun).`,
      'system'
    );
  };

  const handleExtendSubscription = async (listingId: string, days: number = 30) => {
    const target = listings.find(l => l.id === listingId);
    if (!target) return;

    const currentExpiry = target.planExpiresAt ? new Date(target.planExpiresAt).getTime() : Date.now();
    const newExpiry = new Date(currentExpiry + days * 24 * 60 * 60 * 1000).toISOString();

    const planObj = plans.find(p => p.id === target.plan);
    const price = planObj ? planObj.price : 0;
    
    const newSub: SubscriptionHistoryItem = {
      id: `sub-ext-${Date.now()}`,
      listingId,
      listingTitle: target.title,
      planId: target.plan || 'standard',
      startDate: new Date().toISOString(),
      endDate: newExpiry,
      status: 'active',
      pricePaid: price
    };

    try {
      await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planExpiresAt: newExpiry })
      });
      await fetch('/api/subscription-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub)
      });
    } catch (err) {
      console.warn("API subscription extension failed, updating local state", err);
    }

    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return {
          ...l,
          planExpiresAt: newExpiry
        };
      }
      return l;
    }));
    setSubscriptionHistory(prev => [newSub, ...prev]);

    triggerNotification(
      "Obuna muddati uzaytirildi",
      `'${target.title}' e'lonining ${target.plan?.toUpperCase()} obuna muddati yana ${days} kunga uzaytirildi!`,
      'system'
    );
  };

  const handleExpireSubscription = (listingId: string) => {
    setListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return {
          ...l,
          plan: 'standard',
          planExpiresAt: undefined,
          isPremium: false
        };
      }
      return l;
    }));

    const target = listings.find(l => l.id === listingId);
    if (target) {
      const newSub: SubscriptionHistoryItem = {
        id: `sub-exp-man-${Date.now()}`,
        listingId,
        listingTitle: target.title,
        planId: target.plan || 'standard',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        status: 'expired',
        pricePaid: 0
      };
      setSubscriptionHistory(prev => [newSub, ...prev]);

      triggerNotification(
        "Obuna to'xtatildi",
        `'${target.title}' e'lonining obunasi to'xtatilib Standard holatiga tushirildi.`,
        'system'
      );
    }
  };

  const handleSharePhone = async (demoPhone?: string | any) => {
    const tg = (window as any).Telegram?.WebApp;
    let phoneNumber = '';

    if (typeof demoPhone === 'string' && demoPhone.trim() !== '') {
      submitPhone(demoPhone);
      return;
    }

    if (tg && tg.requestContact) {
      // Trigger native Telegram contact sharing
      tg.requestContact((success: boolean, response: any) => {
        if (success) {
          phoneNumber = response?.contact?.phone_number || '';
          if (!phoneNumber) {
            phoneNumber = `+998 90 ${Math.floor(1000000 + Math.random() * 9000000)}`;
          }
          submitPhone(phoneNumber);
        }
      });
    } else {
      // Web browser simulation modal or auto-generation
      const confirmed = window.confirm("SARA UYLAR\n\nIlova sizning telefon raqamingizni olishga ruxsat so'ramoqda.");
      if (confirmed) {
        phoneNumber = `+998 90 ${Math.floor(1000000 + Math.random() * 9000000)}`;
        submitPhone(phoneNumber);
      }
    }
  };

  const handleRefreshUser = async () => {
    try {
      console.log(`[CLIENT LOG] Refreshing user data for telegramId: ${currentUser?.telegramId}`);
      // Add timestamp to query string and no-cache headers to completely bypass browser and CDN caching
      const res = await fetch(`/api/users/${currentUser.telegramId}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (res.ok) {
        const dbUser = await res.json();
        console.log(`[CLIENT LOG] Refreshed user data response:`, dbUser);
        setCurrentUser(dbUser);
        triggerNotification(
          "Profil yangilandi",
          dbUser.isVerifiedSeller 
            ? `Tabriklaymiz, profilingiz tasdiqlandi! Raqam: ${dbUser.phoneNumber}`
            : "Profil ma'lumotlari muvaffaqiyatli yangilandi.",
          "system"
        );
        return dbUser;
      } else {
        console.warn(`[CLIENT LOG] Refresh user fetch failed with status: ${res.status}`);
      }
    } catch (err) {
      console.warn("User refresh failed", err);
    }
    return currentUser;
  };

  const submitPhone = async (phone: string) => {
    // 1. Update local user state
    const updatedUser = {
      ...currentUser,
      phoneNumber: phone,
      isVerifiedSeller: true // Mark as verified broker
    };
    setCurrentUser(updatedUser);

    // 2. Save on database
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });

      // 3. Send Bot confirmation message
      await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `📱 <b>Telefon raqamingiz tasdiqlandi!</b>\n\nSara Uylar tizimida profilingiz muvaffaqiyatli faollashtirildi.\n\n👤 Broker: <b>${currentUser.fullName}</b>\n📞 Raqam: <b>${phone}</b>\n\nEndi siz e'lonlarni ko'rishingiz, xabarlar yozishingiz va o'z uylaringizni joylashtirishingiz mumkin!`
        })
      });
    } catch (err) {
      console.warn("Backend phone registration failed", err);
    }

    triggerNotification(
      "Telefon raqami bog'landi",
      `Tizimda sizning profilingiz tasdiqlandi: ${phone}`,
      'system'
    );
  };

  // Approve Payment
  const handleApprovePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/${id}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        const approvedPay = await res.json();
        setPayments(prev => prev.map(p => p.id === id ? approvedPay : p));
        
        // Re-fetch user profile to sync the newly activated subscription package
        const resUser = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId: currentUser.telegramId })
        });
        if (resUser.ok) {
          const updatedUser = await resUser.json();
          setCurrentUser(updatedUser);
        }

        // Re-fetch listings and subscription history
        const [resListings, resHistory] = await Promise.all([
          fetch('/api/listings').then(r => r.json()),
          fetch('/api/subscription-history').then(r => r.json())
        ]);
        if (resListings && Array.isArray(resListings)) setListings(resListings);
        if (resHistory && Array.isArray(resHistory)) setSubscriptionHistory(resHistory);

        triggerNotification(
          "To'lov tasdiqlandi",
          `Tarif muvaffaqiyatli faollashtirildi!`,
          'system'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reject Payment
  const handleRejectPayment = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/payments/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason })
      });
      if (res.ok) {
        const rejectedPay = await res.json();
        setPayments(prev => prev.map(p => p.id === id ? rejectedPay : p));
        triggerNotification(
          "To'lov rad etildi",
          `To'lov rad etildi: ${reason}`,
          'system'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Payment Request
  const handleAddPayment = async (paymentData: any) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (res.ok) {
        const saved = await res.json();
        setPayments(prev => [saved, ...prev]);
        triggerNotification(
          "To'lov yuborildi",
          `Sizning to'lovingiz qabul qilindi va tekshirilmoqda.`,
          'system'
        );
        return saved;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Show forbidden screen ONLY if they are explicitly trying to access the admin domain but are not authorized
  if (isAdminDomain && !isAdminAuthorized) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center font-sans text-white p-6 z-50 overflow-y-auto">
        <div className="flex flex-col items-center gap-6 max-w-md text-center bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-550 shadow-lg">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="space-y-3">
            <span className="text-[9px] bg-amber-500/10 text-amber-400 font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/10">Boshqaruv Markazi</span>
            <h2 className="text-xl font-black text-white tracking-tight">Ruxsat Yo'q (Forbidden)</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Ushbu sahifa faqatgina tizim administratorlari uchun mo'ljallangan. Sizning Telegram hisobingiz (ID: {currentUser?.telegramId || 'Noma\'lum'}) boshqaruv huquqiga ega emas.
            </p>
          </div>

          <div className="w-full pt-4 space-y-3">
            <a 
              href="https://t.me/SARAUYLAR1_BOT"
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full py-4 bg-[#0082D5] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-98"
            >
              Telegram Botni Ochish
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-500 selection:text-white">
      {/* 1. MAIN GLOBAL ALERT SYSTEM */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-4 inset-x-4 mx-auto max-w-sm bg-white border border-[#E2EAF8] rounded-2xl p-4 shadow-xl z-50 flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded-full bg-[#0082D5]/10 flex items-center justify-center shrink-0 text-[#0082D5]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-slate-900 tracking-tight">{activeAlert.title}</h4>
                <span className="text-[8px] text-slate-400">{activeAlert.createdAt}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">{activeAlert.message}</p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[8px] text-blue-600 font-extrabold uppercase tracking-widest">SARA UYLAR SYSTEM</span>
                <button 
                  onClick={() => setActiveAlert(null)}
                  className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  Yopish
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ADMIN INTERACTIVE CONTROL PANEL FLOAT */}
      {isAdmin && adminMode && (
        <div className="bg-slate-900 text-white py-2.5 px-6 flex items-center justify-between border-b border-white/5 shadow-md relative z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">SARA UYLAR — ADMIN PANEL</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminMode(false)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" /> Mini Appga Qaytish
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN APP RENDER CONTEXT */}
      {isAdmin && adminMode ? (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <AdminPanel 
            listings={listings}
            inquiries={inquiries}
            regions={regions}
            districts={districts}
            plans={plans}
            subscriptionHistory={subscriptionHistory}
            payments={payments}
            users={users}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
            onDeleteListing={handleDeleteListing}
            onTogglePremium={handleTogglePremiumListing}
            onProcessInquiry={handleProcessInquiry}
            onArchiveInquiry={handleArchiveInquiry}
            onBroadcastMessage={handleBroadcastMessage}
            onAddRegion={handleAddRegion}
            onAddDistrict={handleAddDistrict}
            onEditPlanPrice={handleEditPlanPrice}
            onAddPlan={handleCreatePlan}
            onActivateSubscription={handleActivateSubscription}
            onExtendSubscription={handleExtendSubscription}
            onExpireSubscription={handleExpireSubscription}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] py-4 px-2 sm:px-4">
          {/* Exact Mobile Mock container for absolute visual symmetry, adaptively styled for multiple screens */}
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white border border-[#E2EAF8] shadow-[0_12px_40px_rgba(0,102,204,0.06)] rounded-[32px] overflow-hidden flex flex-col min-h-[800px] max-h-[800px] relative">
            <div className="flex-1 overflow-y-auto flex flex-col bg-[#F8FAFC]">
              {currentUser && (
                <MiniApp 
                  regions={regions}
                  districts={districts}
                  listings={listings}
                  inquiries={inquiries}
                  reviews={reviews}
                  plans={plans}
                  onToggleFavorite={handleToggleFavorite}
                  onAddInquiry={handleAddInquiryFromMiniApp}
                  onAddListing={handleAddListing}
                  onUpdateListing={handleUpdateListing}
                  onDeleteListing={handleDeleteListing}
                  favorites={favorites}
                  currentUser={{
                    id: currentUser.id,
                    fullName: currentUser.fullName,
                    phone: currentUser.phoneNumber || '',
                    phoneNumber: currentUser.phoneNumber || '',
                    isRegistered: currentUser.isRegistered || false,
                    username: currentUser.username,
                    avatarUrl: currentUser.avatarUrl,
                    telegramId: currentUser.telegramId,
                    isVerifiedSeller: currentUser.isVerifiedSeller || false,
                    phone_verified: currentUser.phone_verified || false,
                    packageId: currentUser.packageId || 'standard',
                    packageExpiresAt: currentUser.packageExpiresAt,
                    listingsCreatedCount: currentUser.listingsCreatedCount || 0
                  }}
                  botUsername={botUsername}
                  isAdmin={isAdmin}
                  onToggleAdminMode={() => setAdminMode(true)}
                  initialFilters={passedFilters}
                  onClearInitialFilters={() => setPassedFilters(null)}
                  onVerifyPhone={handleSharePhone}
                  onRefreshUser={handleRefreshUser}
                  payments={payments}
                  onAddPayment={handleAddPayment}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
