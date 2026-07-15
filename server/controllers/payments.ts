import { Request, Response } from 'express';
import { dbRepository } from '../db/database';
import { bot } from '../services/telegramBot';

export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await dbRepository.getPayments();
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching payments' });
  }
}

export async function submitPayment(req: Request, res: Response) {
  try {
    const paymentData = {
      ...req.body,
      status: 'approved'
    };
    const newPayment = await dbRepository.createPayment(paymentData);

    // Update user active package
    const users = await dbRepository.getUsers();
    const user = users.find(u => u.id === newPayment.userId || u.telegramId === newPayment.userId || u.username === newPayment.userId);
    
    if (user) {
      const durationDays = newPayment.packageId === 'vip' ? 30 : newPayment.packageId === 'premium' ? 30 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);
      
      await dbRepository.updateUser(user.telegramId, {
        packageId: newPayment.packageId,
        packageExpiresAt: expiresAt.toISOString()
      });
    }

    // Upgrade Listing plan if a specific listingId was linked to the payment
    if (newPayment.listingId) {
      const listing = await dbRepository.getListingById(newPayment.listingId);
      if (listing) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await dbRepository.updateListing(newPayment.listingId, {
          plan: newPayment.packageId,
          planExpiresAt: expiresAt.toISOString(),
          isPremium: newPayment.packageId === 'vip' || newPayment.packageId === 'premium'
        });
      }
    }

    // Add subscription history item
    await dbRepository.createSubscriptionHistoryItem({
      listingId: newPayment.listingId || 'all_listings',
      listingTitle: newPayment.listingId ? `Listing Promotion (${newPayment.listingId})` : `User Package Subscription: ${newPayment.packageId.toUpperCase()}`,
      planId: newPayment.packageId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      pricePaid: newPayment.amount
    });

    // Send Bot message to user about instant activation
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const chatIdStr = user ? user.telegramId : newPayment.userId;
        const chatId = parseInt(chatIdStr);
        if (!isNaN(chatId)) {
          await bot.sendMessage(
            chatId, 
            `✅ <b>Sara Uylar: To'lov tasdiqlandi va tarif faollashtirildi!</b>\n\n` +
            `Sizning <b>${newPayment.packageId.toUpperCase()}</b> tarif obunasi uchun yuborgan <b>${newPayment.amount.toLocaleString()} UZS</b> to'lovingiz tasdiqlandi. Endi siz yangi e'lonlar joylashtirishingiz va xizmatlarimizdan to'liq foydalanishingiz mumkin!`,
            { parse_mode: 'HTML' }
          );
        }
      } catch (e) {
        console.error('Failed to send submit payment bot message:', e);
      }
    }

    res.status(201).json(newPayment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error submitting payment' });
  }
}

export async function approvePayment(req: Request, res: Response) {
  try {
    const paymentId = req.params.id;
    const payment = await dbRepository.updatePayment(paymentId, { status: 'approved' });

    // Update user active package
    const users = await dbRepository.getUsers();
    const user = users.find(u => u.id === payment.userId || u.telegramId === payment.userId || u.username === payment.userId);
    
    if (user) {
      const durationDays = payment.packageId === 'vip' ? 30 : payment.packageId === 'premium' ? 30 : 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);
      
      await dbRepository.updateUser(user.telegramId, {
        packageId: payment.packageId,
        packageExpiresAt: expiresAt.toISOString()
      });
    }

    // Upgrade Listing plan if a specific listingId was linked to the payment
    if (payment.listingId) {
      const listing = await dbRepository.getListingById(payment.listingId);
      if (listing) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await dbRepository.updateListing(payment.listingId, {
          plan: payment.packageId,
          planExpiresAt: expiresAt.toISOString(),
          isPremium: payment.packageId === 'vip' || payment.packageId === 'premium'
        });
      }
    }

    // Add subscription history item
    await dbRepository.createSubscriptionHistoryItem({
      listingId: payment.listingId || 'all_listings',
      listingTitle: payment.listingId ? `Listing Promotion (${payment.listingId})` : `User Package Subscription: ${payment.packageId.toUpperCase()}`,
      planId: payment.packageId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      pricePaid: payment.amount
    });

    // Send Bot message to user about successful approval
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const chatIdStr = user ? user.telegramId : payment.userId;
        const chatId = parseInt(chatIdStr);
        if (!isNaN(chatId)) {
          await bot.sendMessage(
            chatId,
            `✅ <b>Sara Uylar: Tarif muvaffaqiyatli faollashtirildi!</b>\n\n` +
            `Sizning <b>${payment.packageId.toUpperCase()}</b> tarifingiz to'lovi tasdiqlandi. 30 kun davomida siz ko'proq uylarni joylashingiz va VIP xizmatlardan foydalanishingiz mumkin!`,
            { parse_mode: 'HTML' }
          );
        }
      } catch (e) {
        console.error('Failed to send approve payment bot message:', e);
      }
    }

    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error approving payment' });
  }
}

export async function rejectPayment(req: Request, res: Response) {
  try {
    const paymentId = req.params.id;
    const { rejectionReason } = req.body;
    
    const reason = rejectionReason || "To'lov kvitansiyasi tasdiqlanmadi";
    const payment = await dbRepository.updatePayment(paymentId, {
      status: 'rejected',
      rejectionReason: reason
    });

    // Send Bot message to user about rejection
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const users = await dbRepository.getUsers();
        const user = users.find(u => u.id === payment.userId || u.telegramId === payment.userId || u.username === payment.userId);
        const chatIdStr = user ? user.telegramId : payment.userId;
        const chatId = parseInt(chatIdStr);
        if (!isNaN(chatId)) {
          await bot.sendMessage(
            chatId,
            `❌ <b>Sara Uylar: To'lov rad etildi</b>\n\n` +
            `Sizning <b>${payment.packageId.toUpperCase()}</b> tarifi uchun to'lovingiz rad etildi.\n\n` +
            `<b>Sababi:</b> ${reason}\n\n` +
            `Iltimos, kvitansiyani tekshirib qayta yuboring yoki @SaraUylar_Support botiga yozing.`,
            { parse_mode: 'HTML' }
          );
        }
      } catch (e) {
        console.error('Failed to send reject payment bot message:', e);
      }
    }

    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error rejecting payment' });
  }
}
