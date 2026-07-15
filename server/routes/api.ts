import { Router } from 'express';
import { getRegions, createRegion, getDistricts, createDistrict } from '../controllers/regions';
import { getListings, createListing, updateListing, deleteListing } from '../controllers/listings';
import { getInquiries, createInquiry, updateInquiry } from '../controllers/inquiries';
import { getReviews, createReview } from '../controllers/reviews';
import { getPlans, createPlan, updatePlan, getSubscriptionHistory, createSubscriptionHistoryItem } from '../controllers/plans';
import { getUsers, getUserByTelegramId, registerOrUpdateUser, verifyUserStatus } from '../controllers/users';
import { getPayments, submitPayment, approvePayment, rejectPayment } from '../controllers/payments';
import { broadcastMessage, getBotInfo, resetSystem } from '../controllers/admin';
import { parseNaturalLanguageSearch, getSmartRecommendations } from '../controllers/ai';
import { handleAdminLogin, handleAdminLogout, requireAdminAuth, requireTelegramAuth, verifyTelegramInitData } from '../middleware/auth';
import { apiRateLimiter, sanitizeRequestMiddleware } from '../middleware/security';
import { dbRepository } from '../db/database';

const router = Router();

// Apply sanitization middleware to all routes
router.use(sanitizeRequestMiddleware);

// --- Telegram WebApp Secure Verification ---
router.post('/auth/verify-telegram', async (req, res) => {
  const { initData } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

  if (!initData) {
    if (isLocalDev) {
      // Allow seamless mock user fallback during localhost development
      const mockUser = {
        id: 'dev-user-id',
        telegramId: '987654321',
        username: '@sara_client',
        fullName: 'Sara Client',
        phoneNumber: '+998 90 123 45 67',
        avatarUrl: 'https://ui-avatars.com/api/?name=Sara+Client&background=0082D5&color=fff',
        isRegistered: true,
        isVerifiedSeller: true,
        packageId: 'standard',
        packageExpiresAt: '',
        listingsCreatedCount: 0,
        firstName: 'Sara',
        lastName: 'Client',
        isTelegramPremium: false,
        languageCode: 'uz'
      };
      return res.json({ success: true, user: mockUser });
    }
    return res.status(400).json({ error: 'Telegram initData is required' });
  }

  // Verify signature if botToken is configured
  let isValid = false;
  if (botToken) {
    isValid = verifyTelegramInitData(initData, botToken);
  } else if (isLocalDev) {
    // If local dev but botToken is missing, bypass check
    isValid = true;
    console.warn("TELEGRAM_BOT_TOKEN is not defined. Bypassing signature check in local development.");
  }

  if (!isValid) {
    return res.status(403).json({ error: 'Noloyiq Telegram raqamli imzosi (Invalid signature)' });
  }

  try {
    const params = new URLSearchParams(initData);
    const userString = params.get('user');
    if (!userString) {
      return res.status(400).json({ error: 'User data not found in initData' });
    }

    const tgUser = JSON.parse(userString);
    const tgUserId = tgUser.id.toString();
    const tgUsername = tgUser.username ? `@${tgUser.username}` : `@id${tgUser.id}`;
    const tgFullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Telegram User';
    const tgAvatar = tgUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tgUser.first_name || 'User')}&background=0082D5&color=fff`;
    const tgFirstName = tgUser.first_name || '';
    const tgLastName = tgUser.last_name || '';
    const tgIsPremium = !!tgUser.is_premium;
    const tgLanguageCode = tgUser.language_code || 'uz';

    // Fetch or register the user in the database
    let user = await dbRepository.getUserByTelegramId(tgUserId);
    if (!user) {
      user = await dbRepository.createUser({
        telegramId: tgUserId,
        username: tgUsername,
        fullName: tgFullName,
        phoneNumber: '',
        avatarUrl: tgAvatar,
        isRegistered: true,
        isVerifiedSeller: false,
        packageId: 'standard',
        packageExpiresAt: '',
        listingsCreatedCount: 0,
        firstName: tgFirstName,
        lastName: tgLastName,
        isTelegramPremium: tgIsPremium,
        languageCode: tgLanguageCode
      });
    } else {
      // Keep basic Telegram profile details fresh
      user = await dbRepository.updateUser(tgUserId, {
        username: tgUsername,
        avatarUrl: tgAvatar,
        fullName: user.fullName && user.fullName !== 'Telegram User' && user.fullName !== ''
          ? user.fullName
          : tgFullName,
        firstName: tgFirstName,
        lastName: tgLastName,
        isTelegramPremium: tgIsPremium,
        languageCode: tgLanguageCode
      });
    }

    return res.json({ success: true, user });
  } catch (e: any) {
    console.error('Failed to parse and verify user data:', e);
    return res.status(500).json({ error: 'Telegram foydalanuvchi ma\'lumotlarini tekshirishda xatolik: ' + e.message });
  }
});

// --- Admin Auth Endpoints ---
router.post('/admin/login', apiRateLimiter(60 * 1000, 10), handleAdminLogin);
router.post('/admin/logout', handleAdminLogout);

// --- Regions & Districts ---
router.get('/regions', getRegions);
router.post('/regions', requireAdminAuth, createRegion);
router.get('/districts', getDistricts);
router.post('/districts', requireAdminAuth, createDistrict);

// --- Listings ---
router.get('/listings', getListings);
router.post('/listings', createListing); // Keep flexible for testing
router.put('/listings/:id', updateListing);
router.delete('/listings/:id', deleteListing);
router.post('/search/ai', parseNaturalLanguageSearch);
router.get('/recommendations', getSmartRecommendations);

// --- Inquiries (Leads) ---
router.get('/inquiries', getInquiries);
router.post('/inquiries', apiRateLimiter(60 * 1000, 15), createInquiry);
router.put('/inquiries/:id', updateInquiry);

// --- Reviews ---
router.get('/reviews', getReviews);
router.post('/reviews', apiRateLimiter(60 * 1000, 10), createReview);

// --- Plans & Subscription History ---
router.get('/plans', getPlans);
router.post('/plans', requireAdminAuth, createPlan);
router.put('/plans/:id', requireAdminAuth, updatePlan);
router.get('/subscription-history', requireAdminAuth, getSubscriptionHistory);
router.post('/subscription-history', createSubscriptionHistoryItem);

// --- Users ---
router.get('/users', getUsers);
router.get('/users/:telegramId', getUserByTelegramId);
router.post('/users', registerOrUpdateUser);
router.put('/users/:telegramId/verify', requireAdminAuth, verifyUserStatus);

// --- Payments ---
router.get('/payments', requireAdminAuth, getPayments);
router.post('/payments', submitPayment);
router.put('/payments/:id/approve', requireAdminAuth, approvePayment);
router.put('/payments/:id/reject', requireAdminAuth, rejectPayment);

// --- Telegram Admin Tools ---
router.post('/broadcast', requireAdminAuth, broadcastMessage);
router.get('/bot-info', getBotInfo);
router.post('/reset', requireAdminAuth, resetSystem);

export default router;
