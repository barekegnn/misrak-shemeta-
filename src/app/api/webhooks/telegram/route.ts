/**
 * Telegram Bot Webhook Handler
 * 
 * This endpoint receives updates from Telegram when users interact with the bot.
 * It handles /start command and sends the Mini App link with promotional messaging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateWelcomeMessage, 
  generateHelpMessage, 
  generateShopMessage, 
  generateProductsMessage 
} from '@/lib/bot/messages';

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
      language_code?: string;
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
 * Handle /start command with promotional messaging
 */
async function handleStartCommand(chatId: number, firstName: string, languageCode?: string) {
  // Detect language from Telegram user settings
  let language = 'en';
  if (languageCode) {
    if (languageCode.startsWith('am')) language = 'am';
    else if (languageCode.startsWith('om')) language = 'om';
  }

  const welcomeText = generateWelcomeMessage(firstName, language);

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
async function handleMessage(chatId: number, text: string, languageCode?: string) {
  let language = 'en';
  if (languageCode) {
    if (languageCode.startsWith('am')) language = 'am';
    else if (languageCode.startsWith('om')) language = 'om';
  }

  const helpText = generateHelpMessage(language);

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
    const languageCode = from.language_code;

    console.log(`[Telegram] Message from ${from.username || firstName}: ${text}`);

    // Handle /start command
    if (text === '/start') {
      await handleStartCommand(chatId, firstName, languageCode);
    }
    // Handle /help command
    else if (text === '/help') {
      await handleMessage(chatId, text, languageCode);
    }
    // Handle /shop command
    else if (text === '/shop') {
      const shopText = generateShopMessage(
        languageCode?.startsWith('am') ? 'am' : languageCode?.startsWith('om') ? 'om' : 'en'
      );

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
      const productsText = generateProductsMessage(
        languageCode?.startsWith('am') ? 'am' : languageCode?.startsWith('om') ? 'om' : 'en'
      );

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
      await handleMessage(chatId, text || '', languageCode);
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
