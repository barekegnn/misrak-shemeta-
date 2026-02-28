/**
 * Simulate Chapa Payment Webhook for Local Testing
 * 
 * This script simulates a successful payment webhook from Chapa
 * to test the order payment flow locally without needing a real Chapa API key.
 * 
 * Usage:
 *   npx tsx scripts/simulate-chapa-webhook.ts <orderId>
 * 
 * Example:
 *   npx tsx scripts/simulate-chapa-webhook.ts 0rMR0WxkNbVCUY5OegTS
 */

const orderId = process.argv[2];

if (!orderId) {
  console.error('❌ Error: Order ID is required');
  console.log('Usage: npx tsx scripts/simulate-chapa-webhook.ts <orderId>');
  process.exit(1);
}

const webhookUrl = 'http://localhost:3000/api/webhooks/chapa';

// Simulate successful payment webhook payload
const payload = {
  event: 'charge.success',
  data: {
    tx_ref: orderId,
    status: 'success',
    amount: 3260, // This should match the order amount
    currency: 'ETB',
    reference: `CHAPA_${orderId}_${Date.now()}`,
    created_at: new Date().toISOString(),
  },
};

console.log('🔄 Simulating Chapa webhook...');
console.log('📦 Order ID:', orderId);
console.log('🌐 Webhook URL:', webhookUrl);
console.log('📄 Payload:', JSON.stringify(payload, null, 2));
console.log('');

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then(async (response) => {
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook processed successfully!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('🎉 Order status should now be PAID_ESCROW');
      console.log('🔍 Check Firebase Emulator UI: http://127.0.0.1:4000/firestore');
    } else {
      console.error('❌ Webhook failed!');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Error calling webhook:', error.message);
    process.exit(1);
  });
