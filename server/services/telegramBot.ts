import { dbRepository } from '../db/database';

export class CustomTelegramBot {
  private token: string;
  private offset: number = 0;
  private isPolling: boolean = false;
  private onMessageCallback?: (msg: any) => void;
  private onCallbackQueryCallback?: (query: any) => void;

  constructor(token: string) {
    this.token = token;
  }

  async sendRequest(method: string, body: any) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (e) {
      console.error(`Telegram Bot Error (${method}):`, e);
      return null;
    }
  }

  async sendMessage(chatId: string | number, text: string, options: any = {}) {
    return this.sendRequest('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options
    });
  }

  onMessage(callback: (msg: any) => void) {
    this.onMessageCallback = callback;
  }

  onCallbackQuery(callback: (query: any) => void) {
    this.onCallbackQueryCallback = callback;
  }

  startPolling() {
    if (!this.token) {
      console.log("⚠️ TELEGRAM_BOT_TOKEN is not configured. Polling is disabled.");
      return;
    }
    if (this.isPolling) return;
    this.isPolling = true;
    console.log("Telegram Bot polling started on background thread...");
    this.poll();
  }

  private async poll() {
    while (this.isPolling) {
      try {
        const res = await this.sendRequest('getUpdates', {
          offset: this.offset,
          timeout: 20,
          allowed_updates: ['message', 'callback_query']
        });
        if (res && res.ok && res.result && res.result.length > 0) {
          for (const update of res.result) {
            this.offset = update.update_id + 1;
            if (update.message && this.onMessageCallback) {
              await this.onMessageCallback(update.message);
            } else if (update.callback_query && this.onCallbackQueryCallback) {
              await this.onCallbackQueryCallback(update.callback_query);
            }
          }
        }
      } catch (err) {
        console.error("Telegram polling error, retrying in 5 seconds...", err);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  stopPolling() {
    this.isPolling = false;
  }
}

// Instantiate the bot
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const bot = new CustomTelegramBot(BOT_TOKEN);

// User State Machine
const userStates: Record<number, { 
  step: string; 
  data?: any; 
}> = {};

// Helper to notify active administrators/channels about inquiries or registrations
export async function notifyAdmin(text: string) {
  if (!BOT_TOKEN) return;
  try {
    const subscribers = await dbRepository.getSubscribers();
    for (const chatId of subscribers) {
      try {
        await bot.sendMessage(chatId, text);
      } catch (e) {
        // ignore individual failures
      }
    }
  } catch (err) {
    console.error('Error notifying admins:', err);
  }
}

// Initialize Bot Events
export function initializeBot() {
  if (!BOT_TOKEN) {
    console.log("⚠️ TELEGRAM_BOT_TOKEN is not configured. Bot features are disabled.");
    return;
  }

  bot.onMessage(async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    
    // Register subscriber if not already present
    await dbRepository.addSubscriber(chatId);

    const tgId = msg.from.id.toString();
    const existingUser = await dbRepository.getUserByTelegramId(tgId);

    // Intercept shared contact details for frictionless verification, ensuring user.id matches
    if (msg.contact && msg.contact.phone_number) {
      const contactUserId = msg.contact.user_id ? msg.contact.user_id.toString() : null;
      if (contactUserId && contactUserId !== tgId) {
        await bot.sendMessage(chatId, "⚠️ Xavfsizlik qoidalariga ko'ra faqatgina o'zingizning kontakt ma'lumotingizni tasdiqlashingiz mumkin.");
        return;
      }

      let phone = msg.contact.phone_number;
      if (!phone.startsWith('+')) {
        phone = '+' + phone;
      }
      
      console.log(`[BOT LOG] Verifying contact. Telegram user.id: ${tgId}, Phone number found: ${phone}`);

      const userInDb = await dbRepository.getUserByTelegramId(tgId);
      if (userInDb) {
        await dbRepository.updateUser(tgId, {
          phoneNumber: phone,
          phone_verified: true,
          isVerifiedSeller: true,
          isRegistered: true
        });
      } else {
        const fullName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'Telegram User';
        await dbRepository.createUser({
          telegramId: tgId,
          username: msg.from.username ? `@${msg.from.username}` : `@id${tgId}`,
          fullName: fullName,
          phoneNumber: phone,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0082D5&color=fff`,
          isRegistered: true,
          isVerifiedSeller: true,
          phone_verified: true,
          packageId: 'standard',
          packageExpiresAt: '',
          listingsCreatedCount: 0
        });
      }

      userStates[chatId] = { step: 'none' };
      const appUrl = process.env.APP_URL || `https://localhost:3000`;
      
      await bot.sendMessage(chatId, 
        `✅ <b>Telefon raqamingiz muvaffaqiyatli tasdiqlandi!</b>\n\n` +
        `Raqam: <b>${phone}</b>\n\n` +
        `Siz endi "Tasdiqlangan Foydalanuvchi" (Verified Seller) statusiga egasiz va mini ilovadan to'liq foydalana olasiz!`,
        {
          reply_markup: {
            keyboard: [
              [{ text: "📱 Mini Ilovani Ochish", web_app: { url: appUrl } }],
              [{ text: "🔍 Mulk Qidirish" }, { text: "➕ E'lon Berish" }],
              [{ text: "ℹ️ Ma'lumot" }, { text: "📞 Bog'lanish" }]
            ],
            resize_keyboard: true
          }
        }
      );
      return;
    }

    // Cancel Phone Verification or other actions
    if (text === "❌ Bekor qilish") {
      userStates[chatId] = { step: 'none' };
      const appUrl = process.env.APP_URL || `https://localhost:3000`;
      await bot.sendMessage(chatId, "Telefon raqamini tasdiqlash bekor qilindi.", {
        reply_markup: {
          keyboard: [
            [{ text: "📱 Mini Ilovani Ochish", web_app: { url: appUrl } }],
            [{ text: "🔍 Mulk Qidirish" }, { text: "➕ E'lon Berish" }],
            [{ text: "ℹ️ Ma'lumot" }, { text: "📞 Bog'lanish" }]
          ],
          resize_keyboard: true
        }
      });
      return;
    }

    // Command Parser
    if (text.startsWith('/start')) {
      userStates[chatId] = { step: 'none' };
      const appUrl = process.env.APP_URL || `https://localhost:3000`;

      // Check for deep-linked phone verification query
      if (text.includes('verify_phone')) {
        await bot.sendMessage(chatId, 
          `📱 <b>SARA UYLAR: Telefon raqamini tasdiqlash</b>\n\n` +
          `Mini ilovada himoyalangan amallarni (e'lon berish, aloqa va h.k.) bajarish uchun telefon raqamingizni tasdiqlashingiz kerak.\n\n` +
          `Iltimos, pastdagi <b>"📱 Telefon raqamini ulashish"</b> tugmasini bosing:`,
          {
            reply_markup: {
              keyboard: [
                [{ text: "📱 Telefon raqamini ulashish", request_contact: true }],
                [{ text: "❌ Bekor qilish" }]
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          }
        );
        return;
      }

      const greetingName = existingUser?.fullName || [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';
      const statusText = existingUser?.phoneNumber || existingUser?.phone_verified
        ? `✅ Profilingiz tasdiqlangan\n📞 Telefon: <b>${existingUser.phoneNumber || ''}</b>`
        : `⚠️ Profilingiz hali tasdiqlanmagan. Mini ilova ichida biror amal bajarganingizda uni osongina tasdiqlashingiz mumkin.`;

      await bot.sendMessage(chatId, 
        `🏠 <b>SARA UYLAR Ko'chmas Mulk Botiga xush kelibsiz!</b>\n\n` +
        `👤 Foydalanuvchi: <b>${greetingName}</b>\n` +
        `${statusText}\n\n` +
        `Iltimos, boshlash uchun quyidagi menyulardan birini tanlang:`,
        {
          reply_markup: {
            keyboard: [
              [{ text: "📱 Mini Ilovani Ochish", web_app: { url: appUrl } }],
              [{ text: "🔍 Mulk Qidirish" }, { text: "➕ E'lon Berish" }],
              [{ text: "ℹ️ Ma'lumot" }, { text: "📞 Bog'lanish" }]
            ],
            resize_keyboard: true
          }
        }
      );
      return;
    }

    const state = userStates[chatId] || { step: 'none' };

    if (text === "🔍 Mulk Qidirish") {
      userStates[chatId] = { step: 'search_deal_type', data: {} };
      await bot.sendMessage(chatId, "Kelishuv turini tanlang:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Sotib olish (Kvartira / Hovli)", callback_data: "search_deal_sale" }],
            [{ text: "Ijara (Kvartira / Hovli)", callback_data: "search_deal_rent" }]
          ]
        }
      });
      return;
    }

    if (text === "➕ E'lon Berish") {
      userStates[chatId] = { step: 'add_name', data: { imageUrls: [] } };
      await bot.sendMessage(chatId, "➕ <b>Yangi e'lon joylashtirishni boshlaymiz!</b>\n\nSotuvchi yoki ijaraga beruvchining ismini kiriting (Masalan: Rustam Karimov):", {
        reply_markup: { remove_keyboard: true }
      });
      return;
    }

    if (text === "ℹ️ Ma'lumot") {
      const appUrl = process.env.APP_URL || `https://localhost:3000`;
      await bot.sendMessage(chatId, 
        `💡 <b>SARA UYLAR Platformasi haqida:</b>\n\n` +
        `Platformamiz ko'chmas mulk oldi-sotdisi va ijarasini osonlashtiradi.\n` +
        `- E'lonlar to'liq tekshiruvdan o'tadi (Moderatsiya).\n` +
        `- VIP va Premium darajadagi e'lonlar portalning eng yuqori qismida namoyish etiladi.\n` +
        `- To'g'ridan-to'g'ri sotuvchi bilan bog'lanish va xaritadan ko'rish imkoniyati mavjud.\n\n` +
        `Batafsil ma'lumotni Mini ilovamizdan topasiz!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📱 Mini ilovani ochish", web_app: { url: appUrl } }]
            ]
          }
        }
      );
      return;
    }

    if (text === "📞 Bog'lanish") {
      await bot.sendMessage(chatId, 
        `📞 <b>Sara Uylar Call Center:</b>\n\n` +
        `Murojaatlar va hamkorlik uchun admin bilan bog'laning:\n` +
        `• Telefon: +998 71 200 00 00\n` +
        `• Telegram: @SaraUylar_Support\n\n` +
        `Ish vaqti: 24/7`
      );
      return;
    }

    // State machine steps for ADD LISTING
    if (state.step === 'add_name') {
      state.data.ownerName = text;
      state.step = 'add_phone';
      await bot.sendMessage(chatId, "Yaxshi. Telefon raqamingizni kiriting (Masalan: +998 90 123 45 67):", {
        reply_markup: {
          keyboard: [
            [{ text: "📞 Raqamni yuborish", request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      return;
    }

    if (state.step === 'add_phone') {
      let phone = text;
      if (msg.contact && msg.contact.phone_number) {
        phone = msg.contact.phone_number;
      }
      state.data.ownerPhone = phone;
      state.data.ownerTelegram = msg.from.username ? `@${msg.from.username}` : '';
      state.step = 'add_title';
      await bot.sendMessage(chatId, "Mulk sarlavhasini kiriting (Masalan: Oybek metrosida 3 xonali hashamatli kvartira):", {
        reply_markup: { remove_keyboard: true }
      });
      return;
    }

    if (state.step === 'add_title') {
      state.data.title = text;
      state.step = 'add_deal_type';
      await bot.sendMessage(chatId, "Kelishuv turini tanlang:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Sotish", callback_data: "add_deal_sale" }],
            [{ text: "Ijara", callback_data: "add_deal_rent" }]
          ]
        }
      });
      return;
    }

    if (state.step === 'add_address') {
      state.data.address = text;
      state.data.googleMapUrl = 'https://maps.google.com/?q=41.3110,69.2405';
      state.step = 'add_price';
      await bot.sendMessage(chatId, "Mulk narxini kiriting (faqat raqam bilan, AQSH dollarida. Masalan: 85000):");
      return;
    }

    if (state.step === 'add_price') {
      const priceVal = parseInt(text.replace(/\D/g, ''));
      if (isNaN(priceVal)) {
        await bot.sendMessage(chatId, "Iltimos, narxni faqat raqamlar bilan kiriting:");
        return;
      }
      state.data.price = priceVal;
      state.step = 'add_area';
      await bot.sendMessage(chatId, "Mulk maydonini kiriting (kvadrat metrda, masalan: 72):");
      return;
    }

    if (state.step === 'add_area') {
      const areaVal = parseFloat(text);
      if (isNaN(areaVal)) {
        await bot.sendMessage(chatId, "Iltimos, maydonni raqamda kiriting (masalan: 72.5):");
        return;
      }
      state.data.area = areaVal;
      state.step = 'add_rooms';
      await bot.sendMessage(chatId, "Xonalar sonini kiriting (masalan: 3):");
      return;
    }

    if (state.step === 'add_rooms') {
      const roomsVal = parseInt(text);
      if (isNaN(roomsVal)) {
        await bot.sendMessage(chatId, "Iltimos, xonalar sonini raqamda kiriting:");
        return;
      }
      state.data.rooms = roomsVal;
      state.step = 'add_description';
      await bot.sendMessage(chatId, "Mulk haqida to'liq tavsif (description) kiriting:");
      return;
    }

    if (state.step === 'add_description') {
      state.data.description = text;
      state.step = 'add_image';
      await bot.sendMessage(chatId, "Mulk rasmining havolasini kiriting (Masalan Unsplash link) yoki o'tkazib yuborish uchun 'skip' deb yozing:");
      return;
    }

    if (state.step === 'add_image') {
      let imageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';
      if (text.toLowerCase() !== 'skip' && text.startsWith('http')) {
        imageUrl = text;
      }
      state.data.imageUrls = [imageUrl];

      // Build complete object
      const newListing = await dbRepository.createListing({
        ownerName: state.data.ownerName,
        ownerPhone: state.data.ownerPhone,
        ownerTelegram: state.data.ownerTelegram,
        title: state.data.title,
        dealType: state.data.dealType,
        propertyType: state.data.propertyType,
        regionId: state.data.regionId,
        districtId: state.data.districtId,
        address: state.data.address,
        googleMapUrl: state.data.googleMapUrl,
        price: state.data.price,
        area: state.data.area,
        rooms: state.data.rooms,
        description: state.data.description,
        isPremium: false,
        plan: 'standard',
        hasGas: true,
        hasElectricity: true,
        hasWater: true,
        hasSewage: true,
        hasInternet: true,
        hasParking: true,
        hasFurniture: true,
        hasSecurity: true,
        imageUrls: state.data.imageUrls,
        status: 'pending'
      });

      // Reset state
      userStates[chatId] = { step: 'none' };

      const appUrl = process.env.APP_URL || `https://localhost:3000`;

      await bot.sendMessage(chatId, 
        `🎉 <b>E'loningiz qabul qilindi!</b>\n\n` +
        `E'lon hozir moderatsiyada. Administrator tasdiqlaganidan keyin platformada va botda ko'rinadi.\n\n` +
        `E'lon ID: <code>${newListing.id}</code>`,
        {
          reply_markup: {
            keyboard: [
              [{ text: "📱 Mini Ilovani Ochish", web_app: { url: appUrl } }],
              [{ text: "🔍 Mulk Qidirish" }, { text: "➕ E'lon Berish" }],
              [{ text: "ℹ️ Ma'lumot" }, { text: "📞 Bog'lanish" }]
            ],
            resize_keyboard: true
          }
        }
      );

      // Notify admin immediately
      const bPriceVal = newListing.price.toLocaleString();
      notifyAdmin(`🏠 <b>Yangi e'lon moderatsiyada!</b>\n\nSarlavha: <i>${newListing.title}</i>\nNarxi: $${bPriceVal}\nSotuvchi: ${newListing.ownerName} (${newListing.ownerPhone})\n\nAdmin panelga o'tib tasdiqlashingiz mumkin.`);
      return;
    }
  });

  bot.onCallbackQuery(async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data || '';
    const state = userStates[chatId] || { step: 'none' };
    
    // Answer callback query so it doesn't spin
    await bot.sendRequest('answerCallbackQuery', { callback_query_id: query.id });

    // Handle Search flows
    if (data.startsWith('search_deal_')) {
      const dealType = data.split('_')[2];
      state.data.dealType = dealType;
      state.step = 'search_property_type';
      await bot.sendMessage(chatId, "Mulk turini tanlang:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏢 Kvartira (Apartment)", callback_data: "search_type_apartment" }],
            [{ text: "🏡 Hovli (House)", callback_data: "search_type_house" }],
            [{ text: "📐 Yer uchastkasi (Land)", callback_data: "search_type_land" }],
            [{ text: "💼 Tijoriy mulk (Commercial)", callback_data: "search_type_commercial" }]
          ]
        }
      });
      return;
    }

    if (data.startsWith('search_type_')) {
      const propType = data.split('_')[2];
      state.data.propertyType = propType;
      state.step = 'search_region';

      const regions = await dbRepository.getRegions();
      const regionButtons = regions.map(r => [{ text: r.name, callback_data: `search_region_${r.id}` }]);
      await bot.sendMessage(chatId, "Hududni tanlang:", {
        reply_markup: {
          inline_keyboard: regionButtons
        }
      });
      return;
    }

    if (data.startsWith('search_region_')) {
      const regionId = data.replace('search_region_', '');
      state.data.regionId = regionId;
      state.step = 'search_district';

      const districts = await dbRepository.getDistricts();
      const dButtons = districts
        .filter(d => d.regionId === regionId)
        .map(d => [{ text: d.name, callback_data: `search_district_${d.id}` }]);

      if (dButtons.length === 0) {
        state.data.districtId = 'all';
        state.step = 'search_rooms';
        await bot.sendMessage(chatId, "Xonalar sonini tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "1 xona", callback_data: "search_rooms_1" }, { text: "2 xona", callback_data: "search_rooms_2" }],
              [{ text: "3 xona", callback_data: "search_rooms_3" }, { text: "4+ xonali", callback_data: "search_rooms_4" }],
              [{ text: "Farqi yo'q", callback_data: "search_rooms_0" }]
            ]
          }
        });
      } else {
        await bot.sendMessage(chatId, "Tumanni tanlang:", {
          reply_markup: {
            inline_keyboard: dButtons
          }
        });
      }
      return;
    }

    if (data.startsWith('search_district_')) {
      const districtId = data.replace('search_district_', '');
      state.data.districtId = districtId;
      state.step = 'search_rooms';

      await bot.sendMessage(chatId, "Xonalar sonini tanlang:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "1 xona", callback_data: "search_rooms_1" }, { text: "2 xona", callback_data: "search_rooms_2" }],
            [{ text: "3 xona", callback_data: "search_rooms_3" }, { text: "4+ xonali", callback_data: "search_rooms_4" }],
            [{ text: "Farqi yo'q", callback_data: "search_rooms_0" }]
          ]
        }
      });
      return;
    }

    if (data.startsWith('search_rooms_')) {
      const rooms = parseInt(data.replace('search_rooms_', ''));
      state.data.rooms = rooms;
      
      const appUrl = process.env.APP_URL || `https://localhost:3000`;
      const miniAppQueryUrl = `${appUrl}?dealType=${state.data.dealType}&propertyType=${state.data.propertyType}&regionId=${state.data.regionId}&districtId=${state.data.districtId}&rooms=${state.data.rooms}`;
      
      userStates[chatId] = { step: 'none' };

      await bot.sendMessage(chatId, 
        `🔍 <b>Mulk qidiruv parametrlari saqlandi!</b>\n\n` +
        `• Kelishuv: ${state.data.dealType === 'sale' ? 'Sotish' : 'Ijara'}\n` +
        `• Mulk turi: ${state.data.propertyType}\n` +
        `• Hudud: ${state.data.regionId}\n` +
        `• Xonalar: ${state.data.rooms === 0 ? "Barchasi" : state.data.rooms}\n\n` +
        `Ushbu mezonlar bo'yicha uylarni ko'rish uchun quyidagi mini ilovani oching:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📱 Qidiruv Natijalarini Ko'rish", web_app: { url: miniAppQueryUrl } }]
            ]
          }
        }
      );
      return;
    }

    // Handle Add Listing flows
    if (data.startsWith('add_deal_')) {
      const dealType = data.split('_')[2];
      state.data.dealType = dealType;
      state.step = 'add_property_type';
      await bot.sendMessage(chatId, "Mulk turini tanlang:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏢 Kvartira (Apartment)", callback_data: "add_type_apartment" }],
            [{ text: "🏡 Hovli (House)", callback_data: "add_type_house" }],
            [{ text: "📐 Yer uchastkasi (Land)", callback_data: "add_type_land" }],
            [{ text: "💼 Tijoriy mulk (Commercial)", callback_data: "add_type_commercial" }]
          ]
        }
      });
      return;
    }

    if (data.startsWith('add_type_')) {
      const propType = data.split('_')[2];
      state.data.propertyType = propType;
      state.step = 'add_region';
      const regions = await dbRepository.getRegions();
      const regionButtons = regions.map(r => [{ text: r.name, callback_data: `add_region_${r.id}` }]);
      await bot.sendMessage(chatId, "Viloyatni tanlang:", {
        reply_markup: {
          inline_keyboard: regionButtons
        }
      });
      return;
    }

    if (data.startsWith('add_region_')) {
      const regionId = data.replace('add_region_', '');
      state.data.regionId = regionId;
      state.step = 'add_district';

      const districts = await dbRepository.getDistricts();
      const dButtons = districts
        .filter(d => d.regionId === regionId)
        .map(d => [{ text: d.name, callback_data: `add_district_${d.id}` }]);

      if (dButtons.length === 0) {
        state.data.districtId = '';
        state.step = 'add_address';
        await bot.sendMessage(chatId, "Mulk manzilini kiriting (Masalan: Oybek ko'chasi, 12-uy):");
      } else {
        await bot.sendMessage(chatId, "Tumanni tanlang:", {
          reply_markup: {
            inline_keyboard: dButtons
          }
        });
      }
      return;
    }

    if (data.startsWith('add_district_')) {
      const districtId = data.replace('add_district_', '');
      state.data.districtId = districtId;
      state.step = 'add_address';
      await bot.sendMessage(chatId, "Mulk aniq manzilini kiriting (Masalan: Oybek ko'chasi, 12-uy):");
      return;
    }
  });

  bot.startPolling();
}
