/**
 * Telegram Bot Webhook Handler
 * 
 * This endpoint receives updates from Telegram when users interact with the bot.
 * It handles /start command and sends the Mini App link.
 */

import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://misrak-shemeta.vercel.app';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
}

/**
 * Send a message via Telegram Bot API
 */
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(replyMarkup && { reply_markup: replyMarkup }),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

/**
 * Handle /start command
 */
async function handleStartCommand(chatId: number, firstName: string) {
  const welcomeText = `
👋 Welcome to <b>Misrak Shemeta</b>! 🛍️

I'm your Eastern Ethiopia Marketplace assistant. I'll help you browse shops and products from Harar and Dire Dawa.

<b>How to use:</b>
1. Click the button below to open the marketplace
2. Login with your Telegram account
3. Select your location
4. Start shopping!

Let's get started! 🚀
  `.trim();

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🛍️ Open Marketplace',
          web_app: { url: APP_URL },
        },
      ],
      [
        {
          text: '📱 Direct Link',
          url: APP_URL,
        },
      ],
    ],
  };

  await sendTelegramMessage(chatId, welcomeText, replyMarkup);
}

/**
 * Handle other messages
 */
async function handleMessage(chatId: number, text: string) {
  const helpText = `
<b>Available Commands:</b>

/start - Start the bot and open the marketplace
/help - Show this help message
/shop - Browse shops
/products - Browse products

Or click the button below to open the full marketplace:
  `.trim();

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '🛍️ Open Marketplace',
          web_app: { url: APP_URL },
        },
      ],
    ],
  };

  await sendTelegramMessage(chatId, helpText, replyMarkup);
}

/**
 * POST handler for Telegram webhook
 */
export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    // Verify the update has a message
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const { message_id, from, chat, text } = update.message;
    const chatId = chat.id;
    const firstName = from.first_name;

    console.log(`[Telegram] Message from ${from.username || firstName}: ${text}`);

    // Handle /start command
    if (text === '/start') {
      await handleStartCommand(chatId, firstName);
    }
    // Handle /help command
    else if (text === '/help') {
      await handleMessage(chatId, text);
    }
    // Handle /shop command
    else if (text === '/shop') {
      const shopText = `
🏪 <b>Browse Shops</b>

Click the button below to open the marketplace and browse all available shops from Harar and Dire Dawa.
      `.trim();

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🛍️ Open Marketplace',
              web_app: { url: APP_URL },
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, shopText, replyMarkup);
    }
    // Handle /products command
    else if (text === '/products') {
      const productsText = `
📦 <b>Browse Products</b>

Click the button below to open the marketplace and browse all available products.
      `.trim();

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🛍️ Open Marketplace',
              web_app: { url: APP_URL },
            },
          ],
        ],
      };

      await sendTelegramMessage(chatId, productsText, replyMarkup);
    }
    // Handle any other message
    else {
      await handleMessage(chatId, text || '');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET() {
  return NextResponse.json({
    message: 'Telegram webhook is active',
    timestamp: new Date().toISOString(),
  });
}
