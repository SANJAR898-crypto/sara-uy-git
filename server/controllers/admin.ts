import { Request, Response } from 'express';
import { dbRepository } from '../db/database';
import { bot } from '../services/telegramBot';

export async function broadcastMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const subscribers = await dbRepository.getSubscribers();
    console.log(`Broadcasting message to ${subscribers.length} subscribers...`);
    let successCount = 0;

    if (process.env.TELEGRAM_BOT_TOKEN) {
      for (const chatId of subscribers) {
        try {
          await bot.sendMessage(chatId, `📢 <b>SaraUylar Tizimidan Xabar:</b>\n\n${message}`);
          successCount++;
        } catch (err) {
          console.error(`Failed to send broadcast to ${chatId}:`, err);
        }
      }
    }

    res.json({ success: true, subscribersReached: successCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error broadcasting message' });
  }
}

export async function getBotInfo(req: Request, res: Response) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.json({ 
      status: 'disconnected', 
      message: 'TELEGRAM_BOT_TOKEN muhit o\'zgaruvchisi (Secrets) o\'rnatilmagan.' 
    });
  }

  try {
    const tgRes = await bot.sendRequest('getMe', {});
    if (tgRes && tgRes.ok && tgRes.result) {
      return res.json({
        status: 'connected',
        botInfo: {
          id: tgRes.result.id,
          firstName: tgRes.result.first_name,
          username: tgRes.result.username,
        },
        appUrl: process.env.APP_URL || `https://${req.get('host')}`
      });
    } else {
      return res.json({
        status: 'error',
        message: 'Bot tokeni xato yoki Telegram API bilan bog\'lanib bo\'lmadi.'
      });
    }
  } catch (err: any) {
    return res.json({
      status: 'error',
      message: err.message || 'Noma\'lum xatolik yuz berdi.'
    });
  }
}

export async function resetSystem(req: Request, res: Response) {
  try {
    await dbRepository.resetSystem();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error resetting system' });
  }
}
