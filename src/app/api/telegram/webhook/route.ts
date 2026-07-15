import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

async function callTelegram(method: string, payload: Record<string, unknown>) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

/**
 * Telegram bot webhook. Configure with:
 * https://api.telegram.org/bot<token>/setWebhook?url=<APP_URL>/api/telegram/webhook
 */
export async function POST(req: Request) {
  try {
    const update = await req.json();
    const message = update?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat?.id;
    const text: string | undefined = message.text;

    if (text?.startsWith("/start")) {
      await callTelegram("sendMessage", {
        chat_id: chatId,
        text: "🏠 Sara Uylar — O'zbekistondagi eng yaxshi ko'chmas mulk platformasiga xush kelibsiz!\n\nUy, kvartira, villa va tijorat mulklarini toping yoki o'z e'loningizni bepul joylashtiring.",
        reply_markup: {
          inline_keyboard: [[{ text: "🚀 Ilovani ochish", web_app: { url: APP_URL } }]],
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Sara Uylar Telegram webhook is active" });
}
