import { Request, Response } from 'express';
import { dbRepository } from '../db/database';
import { bot } from '../services/telegramBot';

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await dbRepository.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching users' });
  }
}

export async function getUserByTelegramId(req: Request, res: Response) {
  try {
    const user = await dbRepository.getUserByTelegramId(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching user' });
  }
}

export async function registerOrUpdateUser(req: Request, res: Response) {
  try {
    const userData = req.body;
    if (!userData.telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const user = await dbRepository.getUserByTelegramId(userData.telegramId);
    if (!user) {
      const newUser = await dbRepository.createUser({
        telegramId: userData.telegramId,
        username: userData.username || '',
        fullName: userData.fullName || 'Telegram User',
        phoneNumber: userData.phoneNumber || '',
        avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || 'User')}&background=0082D5&color=fff`,
        isRegistered: userData.isRegistered || false,
        isVerifiedSeller: false,
        packageId: 'standard',
        packageExpiresAt: '',
        listingsCreatedCount: 0
      });
      return res.json(newUser);
    } else {
      const updated = await dbRepository.updateUser(userData.telegramId, {
        ...userData,
        fullName: userData.fullName || user.fullName || 'Telegram User'
      });
      return res.json(updated);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating user' });
  }
}

export async function verifyUserStatus(req: Request, res: Response) {
  try {
    const telegramId = req.params.telegramId;
    const { isVerifiedSeller } = req.body;

    const updatedUser = await dbRepository.updateUser(telegramId, { isVerifiedSeller });

    // Send a bot notification if active
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const chatId = parseInt(telegramId);
        if (!isNaN(chatId)) {
          const text = isVerifiedSeller 
            ? `⚡️ <b>Sara Uylar: Tabriklaymiz!</b>\n\nSizning profilingiz muvaffaqiyatli verifikatsiyadan o'tdi va "Tasdiqlangan Broker" (Verified Seller) ko'k nishoniga ega bo'ldi! Endi sizning e'lonlaringiz qidiruv natijalarida yuqori o'rinlarda ko'rsatiladi.`
            : `⚠️ <b>Sara Uylar:</b>\n\nSizning profilingizdan verifikatsiya holati olib tashlandi. Savollar yuzasidan @SaraUylar_Support bilan bog'laning.`;
          await bot.sendMessage(chatId, text);
        }
      } catch (e) {
        console.error('Failed to send verification bot message:', e);
      }
    }

    res.json(updatedUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error verifying user status' });
  }
}
