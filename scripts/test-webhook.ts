/**
 * Webhook Testing Utility
 * 
 * This script simulates Chapa webhook calls for local testing.
 * Use this to test the payment webhook handler without needing real Chapa transactions.
 * 
 * Usage:
 *   npx ts-node scripts/test-webhook.ts <orderId> <status>
 * 
 * Examples:
 *   npx ts-node scripts/test-webhook.ts abc123 success
 *   npx ts-node scripts/test-webhook.ts abc123 failed
 */

async function testWebhook(orderId: string, status: 'success' | 'failed') {
  const webhookUrl = 'http://localhost:3000/api/webhooks/chapa';

  const payload = {
    event: status === 'success' ? 'charge.success' : 'charge.failed',
    data: {
      tx_ref: orderId,
      status: status,
      amount: 100,
      currency: 'ETB',
      reference: `CHAPA_TEST_${Date.now()}`,
      created_at: new Date().toISOString(),
    },
  };

  console.log('Sending webhook to:', webhookUrl);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Webhook processed successfully');
      if (data.statusChanged) {
        console.log(`   Order status changed: ${data.previousStatus} → ${data.newStatus}`);
      } else {
        console.log(`   ${data.message}`);
      }
    } else {
      console.log('\n❌ Webhook processing failed');
      console.log('   Error:', data.error);
    }
  } catch (error) {
    console.error('\n❌ Failed to send webhook:', error);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: npx ts-node scripts/test-webhook.ts <orderId> <status>');
  console.error('Status must be: success or failed');
  console.error('\nExample: npx ts-node scripts/test-webhook.ts abc123 success');
  process.exit(1);
}

const [orderId, status] = args;

if (status !== 'success' && status !== 'failed') {
  console.error('Status must be: success or failed');
  process.exit(1);
}

testWebhook(orderId, status as 'success' | 'failed');
