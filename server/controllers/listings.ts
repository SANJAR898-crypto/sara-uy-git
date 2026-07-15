import { Request, Response } from 'express';
import { dbRepository } from '../db/database';
import { notifyAdmin } from '../services/telegramBot';
import { getAuthenticatedTelegramUser, ADMIN_IDS } from '../middleware/auth';

export async function getListings(req: Request, res: Response) {
  try {
    const listings = await dbRepository.getListings();
    res.json(listings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching listings' });
  }
}

export async function createListing(req: Request, res: Response) {
  try {
    const newListing = await dbRepository.createListing(req.body);
    
    // Send notification to admin
    const priceVal = typeof newListing.price === 'number' 
      ? newListing.price.toLocaleString() 
      : Number(newListing.price || 0).toLocaleString();
      
    notifyAdmin(
      `🏠 <b>Yangi e'lon keldi!</b>\n\n` +
      `Sarlavha: <i>${newListing.title}</i>\n` +
      `Sotuvchi: ${newListing.ownerName} (${newListing.ownerPhone})\n` +
      `Narxi: $${priceVal}\n\n` +
      `Moderatsiya qilish uchun Admin panelga o'ting.`
    );
    
    res.status(201).json(newListing);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating listing' });
  }
}

export async function updateListing(req: Request, res: Response) {
  try {
    const updated = await dbRepository.updateListing(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating listing' });
  }
}

export async function deleteListing(req: Request, res: Response) {
  try {
    const listingId = req.params.id;
    const listing = await dbRepository.getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is Admin OR Owner
    const authUser = getAuthenticatedTelegramUser(req);
    const isAdmin = authUser && ADMIN_IDS.includes(Number(authUser.id));
    
    // Check owner match
    const isOwner = authUser && (
      (authUser.username && listing.ownerTelegram && authUser.username.toLowerCase().replace('@', '') === listing.ownerTelegram.toLowerCase().replace('@', '')) ||
      (authUser.id && listing.ownerTelegram && authUser.id.toString() === listing.ownerTelegram) ||
      (authUser.username && listing.ownerName && authUser.username.toLowerCase().replace('@', '') === listing.ownerName.toLowerCase().replace('@', ''))
    );

    if (!isAdmin && !isOwner) {
      const adminSecretHeader = req.headers['x-admin-secret'] as string;
      const adminToken = req.headers['x-admin-token'] as string;
      if (!adminSecretHeader && !adminToken) {
        return res.status(403).json({ error: 'Ruxsat berilmadi. Siz ushbu e\'lonni o\'chira olmaysiz.' });
      }
    }

    const deleted = await dbRepository.deleteListing(listingId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error deleting listing' });
  }
}
