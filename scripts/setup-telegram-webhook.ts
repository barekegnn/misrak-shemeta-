/**
 * Setup Telegram Webhook
 * 
 * This script registers the webhook URL with Telegram Bot API
 * so that Telegram sends updates to our server.
 * 
 * Usage: npx ts-node scripts/setup-telegram-webhook.ts
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/telegram`
  : 'https://misrak-shemeta.vercel.app/api/webhooks/telegram';

async function setupWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set');
    process.exit(1);
  }

  try {
    console.log('🔧 Setting up Telegram webhook...');
    console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);

    // Set webhook
    const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message'],
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`   Description: ${data.description}`);
      
      // Get webhook info
      const getInfoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
      const infoResponse = await fetch(getInfoUrl);
      const infoData = await infoResponse.json();
      
      if (infoData.ok) {
        console.log('\n📊 Webhook Info:');
        console.log(`   URL: ${infoData.result.url}`);
        console.log(`   Pending updates: ${infoData.result.pending_update_count}`);
        console.log(`   Last error: ${infoData.result.last_error_message || 'None'}`);
      }
    } else {
      console.error('❌ Failed to set webhook:', data.description);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

setupWebhook();
