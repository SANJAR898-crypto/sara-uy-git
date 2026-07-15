import { Request, Response } from 'express';
import { dbRepository } from '../db/database';
import { notifyAdmin } from '../services/telegramBot';

export async function getInquiries(req: Request, res: Response) {
  try {
    const inquiries = await dbRepository.getInquiries();
    res.json(inquiries);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching inquiries' });
  }
}

export async function createInquiry(req: Request, res: Response) {
  try {
    const newInquiry = await dbRepository.createInquiry(req.body);

    // Send inquiry alert to administrator or channels
    const listing = await dbRepository.getListingById(newInquiry.listingId);
    const listingTitle = listing ? listing.title : "Noma'lum mulk";
    
    notifyAdmin(
      `💬 <b>Yangi Mijoz So'rovi!</b>\n\n` +
      `🏠 <b>Mulk:</b> ${listingTitle}\n` +
      `👤 <b>Ismi:</b> ${newInquiry.userName}\n` +
      `📞 <b>Telefon:</b> ${newInquiry.userPhone}\n` +
      `✈️ <b>Telegram:</b> ${newInquiry.userId}\n` +
      `✉️ <b>Xabar:</b> ${newInquiry.message || "Aloqa so'rovi"}`
    );

    res.status(201).json(newInquiry);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating inquiry' });
  }
}

export async function updateInquiry(req: Request, res: Response) {
  try {
    const updated = await dbRepository.updateInquiry(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating inquiry' });
  }
}
