import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { dbRepository } from '../db/database';
import { PropertyType, DealType } from '../../src/types';

// Lazy initialize Gemini so it fails gracefully if API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required in Settings > Secrets');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export async function parseNaturalLanguageSearch(req: Request, res: Response) {
  try {
    const { query, userId, guestId } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Sorov matni kiritilishi shart (Query is required)' });
    }

    // Log the search query in search history and analytics
    await dbRepository.addSearchQuery(query, null, userId, guestId);
    await dbRepository.logEvent('search', userId, guestId, undefined, { query });

    let parsedFilters = {
      dealType: undefined,
      propertyType: undefined,
      regionId: undefined,
      districtId: undefined,
      priceMax: undefined,
      priceMin: undefined,
      currency: 'USD',
      rooms: undefined,
      areaMin: undefined,
      hasGas: undefined,
      hasFurniture: undefined
    };

    try {
      const ai = getGeminiClient();
      const regions = await dbRepository.getRegions();
      const districts = await dbRepository.getDistricts();

      const regionsStr = regions.map(r => `ID: "${r.id}", Name: "${r.name}" / "${r.nameUz || ''}"`).join('\n');
      const districtsStr = districts.map(d => `ID: "${d.id}", RegionID: "${d.regionId}", Name: "${d.name}"`).join('\n');

      const systemInstruction = `Siz O'zbekiston ko'chmas mulk bozori uchun aqlli yordamchisiz.
Foydalanuvchi yozgan tabiiy tildagi qidiruv matnini tahlil qiling va uni tizim qidiruv filtrlariga o'tkazing.

Mavjud hududlar (Regions):
${regionsStr}

Mavjud tumanlar (Districts):
${districtsStr}

Filtrlash qoidalari:
1. dealType: 'sale' (sotish, sotib olish), 'rent' (ijara, ijaraga olish), 'daily_rent' (sutkalik, kunlik ijara), 'monthly_rent' (oylik ijara). Agar aniqlanmasa, bo'sh qoldiring.
2. propertyType: 'apartment' (kvartira, dom), 'house' (hovli, yer uy), 'villa' (villa), 'cottage' (kottej), 'commercial' (ofis, do'kon, tijorat), 'office' (ofis), 'land' (uchastka yer), 'warehouse' (sklad, omborxona), 'new_building' (novostroyka, yangi bino).
3. Matndagi pul miqdorini tahlil qiling. Agar 'dollar' yoki '$' bo'lsa, currency='USD' va narxni aslicha oling. Agar 'so'm' yoki 'mln' (million) bo'lsa, currency='UZS'. Agar faqat raqam bo'lsa (masalan "500 million"), u holda 500,000,000 qiymatni priceMax yoki priceMin ga qo'ying.
4. Matndan xonalar sonini ('3 xonali', '3 xona') aniqlab, 'rooms' maydoniga butun son sifatida yozing.
5. Hudud va tumanlarni yuqoridagi ro'yxat bo'yicha eng mos ID ga bog'lang (masalan "Namangan" -> samarkand-region yoki toshkent-region bo'lmagani uchun mos regionId topilmasa bo'sh qoldiring, ammo "Toshkentda" -> tashkent-city, "Yunusobod" -> yunusobod).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Foydalanuvchi so'rovi: "${query}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dealType: { type: Type.STRING, description: "Parsed deal type: 'sale', 'rent', 'daily_rent', 'monthly_rent'" },
              propertyType: { type: Type.STRING, description: "Parsed property type: 'apartment', 'house', 'villa', 'cottage', 'commercial', 'office', 'land', 'warehouse', 'new_building'" },
              regionId: { type: Type.STRING, description: "Region ID if matched" },
              districtId: { type: Type.STRING, description: "District ID if matched" },
              priceMax: { type: Type.NUMBER, description: "Maximum price limit detected" },
              priceMin: { type: Type.NUMBER, description: "Minimum price limit detected" },
              currency: { type: Type.STRING, description: "Detected currency: 'USD' or 'UZS'" },
              rooms: { type: Type.INTEGER, description: "Number of rooms requested" },
              areaMin: { type: Type.NUMBER, description: "Minimum area in square meters" },
              hasGas: { type: Type.BOOLEAN, description: "Whether gas supply was explicitly requested" },
              hasFurniture: { type: Type.BOOLEAN, description: "Whether furniture was explicitly requested" }
            }
          }
        }
      });

      if (response.text) {
        const aiFilters = JSON.parse(response.text.trim());
        parsedFilters = { ...parsedFilters, ...aiFilters };
      }
    } catch (err: any) {
      console.warn('Gemini API search parsing failed or key missing. Falling back to local regex parsing:', err.message);
      
      // Local regex fallback (ensures the search functions even WITHOUT an API key!)
      const q = query.toLowerCase();
      
      // Rooms parsing
      const roomMatch = q.match(/(\d+)\s*xona/);
      if (roomMatch) parsedFilters.rooms = parseInt(roomMatch[1]);

      // Deal type parsing
      if (q.includes('sotiladi') || q.includes('sotish') || q.includes('sotib')) {
        parsedFilters.dealType = 'sale';
      } else if (q.includes('ijara') || q.includes('arenda')) {
        if (q.includes('kunlik') || q.includes('sutka')) {
          parsedFilters.dealType = 'daily_rent';
        } else {
          parsedFilters.dealType = 'monthly_rent';
        }
      }

      // Property type parsing
      if (q.includes('kvartira') || q.includes('dom') || q.includes('podyezd')) {
        parsedFilters.propertyType = 'apartment';
      } else if (q.includes('hovli') || q.includes('yer uy') || q.includes('uy hovli')) {
        parsedFilters.propertyType = 'house';
      } else if (q.includes('novostroyka') || q.includes('yangi qurilgan')) {
        parsedFilters.propertyType = 'new_building';
      } else if (q.includes('ofis') || q.includes('office')) {
        parsedFilters.propertyType = 'office';
      } else if (q.includes('yer') || q.includes('uchastka')) {
        parsedFilters.propertyType = 'land';
      }

      // Region/District fallback
      if (q.includes('toshkent') || q.includes('tashkent')) {
        parsedFilters.regionId = 'tashkent-city';
        if (q.includes('yunusobod')) parsedFilters.districtId = 'yunusobod';
        else if (q.includes('mirobod')) parsedFilters.districtId = 'mirobod';
        else if (q.includes('chilonzor')) parsedFilters.districtId = 'chilonzor';
      } else if (q.includes('samarqand') || q.includes('samarkand')) {
        parsedFilters.regionId = 'samarkand-region';
        parsedFilters.districtId = 'samarkand-city';
      }

      // Price limit fuzzy parsing (e.g. "500 million", "50000$")
      const milMatch = q.match(/(\d+)\s*mln|million/);
      if (milMatch) {
        parsedFilters.priceMax = parseInt(milMatch[1]) * 1000000;
        parsedFilters.currency = 'UZS';
      } else {
        const usdMatch = q.match(/(\d+)\s*\$|usd|dollar/);
        if (usdMatch) {
          parsedFilters.priceMax = parseInt(usdMatch[1]);
          parsedFilters.currency = 'USD';
        }
      }
    }

    // Now execute actual listing search filter in database
    const listings = await dbRepository.getListings();
    const filtered = listings.filter(l => {
      // Filter status must be approved or draft
      if (l.status !== 'approved') return false;

      // Deal Type match
      if (parsedFilters.dealType && l.dealType !== parsedFilters.dealType) {
        // Broaden rent matches
        if (parsedFilters.dealType.includes('rent') && !l.dealType.includes('rent')) return false;
      }

      // Property Type match
      if (parsedFilters.propertyType && l.propertyType !== parsedFilters.propertyType) return false;

      // Region match
      if (parsedFilters.regionId && l.regionId !== parsedFilters.regionId) return false;

      // District match
      if (parsedFilters.districtId && l.districtId !== parsedFilters.districtId) return false;

      // Rooms match
      if (parsedFilters.rooms && l.rooms !== parsedFilters.rooms) return false;

      // Amenities matches
      if (parsedFilters.hasGas && !l.hasGas) return false;
      if (parsedFilters.hasFurniture && !l.hasFurniture) return false;

      // Price matching with dynamic currency normalization
      if (parsedFilters.priceMax || parsedFilters.priceMin) {
        const lCurrency = l.currency || 'USD';
        const fCurrency = parsedFilters.currency || 'USD';
        
        let lPriceNormalized = l.price;
        // Normalize to comparison currency (Default USD <=> UZS conversions: 1 USD = 12500 UZS)
        if (lCurrency !== fCurrency) {
          if (fCurrency === 'USD') {
            lPriceNormalized = l.price / 12500;
          } else {
            lPriceNormalized = l.price * 12500;
          }
        }

        if (parsedFilters.priceMax && lPriceNormalized > parsedFilters.priceMax) return false;
        if (parsedFilters.priceMin && lPriceNormalized < parsedFilters.priceMin) return false;
      }

      return true;
    });

    res.json({
      success: true,
      filters: parsedFilters,
      resultsCount: filtered.length,
      results: filtered
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI qidiruvda xatolik yuz berdi' });
  }
}

export async function getSmartRecommendations(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const guestId = req.query.guestId as string;

    const listings = await dbRepository.getListings();
    const approvedListings = listings.filter(l => l.status === 'approved');

    if (approvedListings.length === 0) {
      return res.json([]);
    }

    // Load analytics views/favorites for this user/guest to build preference profile
    const analytics = await dbRepository.getAnalytics();
    const userHistory = analytics.filter(a => 
      (userId && a.userId === userId) || (guestId && a.guestId === guestId)
    );

    const viewedListingIds = userHistory
      .filter(a => a.eventType === 'view' && a.listingId)
      .map(a => a.listingId as string);

    const favs = await dbRepository.getFavoritesByUser(userId || '');
    const favListingIds = favs.map(f => f.listingId);

    const interactiveListingIds = Array.from(new Set([...viewedListingIds, ...favListingIds]));

    // If no history, return trending VIP/Premium listings
    if (interactiveListingIds.length === 0) {
      const topTrending = approvedListings
        .sort((a, b) => {
          // VIP and Premium get priority boost
          const scoreA = (a.isVIP ? 100 : 0) + (a.isPremium ? 50 : 0) + (a.viewsCount || 0);
          const scoreB = (b.isVIP ? 100 : 0) + (b.isPremium ? 50 : 0) + (b.viewsCount || 0);
          return scoreB - scoreA;
        })
        .slice(0, 6);
      return res.json(topTrending);
    }

    // Build user profile preferences
    const interactives = approvedListings.filter(l => interactiveListingIds.includes(l.id));
    
    // Most common regionId
    const regionsMap: Record<string, number> = {};
    let favoriteRegion = '';
    let maxRegionCount = 0;

    // Average price and average rooms
    let totalPrice = 0;
    let totalRooms = 0;
    let counts = 0;

    interactives.forEach(l => {
      regionsMap[l.regionId] = (regionsMap[l.regionId] || 0) + 1;
      if (regionsMap[l.regionId] > maxRegionCount) {
        maxRegionCount = regionsMap[l.regionId];
        favoriteRegion = l.regionId;
      }
      totalPrice += l.price;
      totalRooms += l.rooms;
      counts++;
    });

    const avgPrice = counts > 0 ? totalPrice / counts : 50000;
    const avgRooms = counts > 0 ? Math.round(totalRooms / counts) : 3;

    // Score every listing
    const scoredListings = approvedListings
      .filter(l => !interactiveListingIds.includes(l.id)) // recommend new listings user hasn't interacted with yet
      .map(l => {
        let score = 0;

        // Region match (high weight)
        if (favoriteRegion && l.regionId === favoriteRegion) {
          score += 100;
        }

        // Room closeness
        const roomDiff = Math.abs(l.rooms - avgRooms);
        if (roomDiff === 0) score += 50;
        else if (roomDiff === 1) score += 25;

        // Price closeness (normalized to within 30%)
        const priceRatio = Math.max(l.price, avgPrice) / Math.min(l.price, avgPrice);
        if (priceRatio <= 1.1) score += 50;
        else if (priceRatio <= 1.3) score += 30;
        else if (priceRatio <= 1.6) score += 15;

        // Boost VIP / Premium
        if (l.isVIP) score += 30;
        if (l.isPremium) score += 15;

        // Boost trending (views counts)
        score += Math.min(l.viewsCount || 0, 50) * 0.2;

        return { listing: l, score };
      });

    const recommended = scoredListings
      .sort((a, b) => b.score - a.score)
      .map(item => item.listing)
      .slice(0, 6);

    // If still have empty slots, fill with general popular listings
    if (recommended.length < 6) {
      const remainingSlots = 6 - recommended.length;
      const fillers = approvedListings
        .filter(l => !recommended.some(r => r.id === l.id))
        .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
        .slice(0, remainingSlots);
      recommended.push(...fillers);
    }

    res.json(recommended);

  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tavsiyalarni yuklashda xatolik yuz berdi' });
  }
}
