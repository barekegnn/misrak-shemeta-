# ngrok Active Session

## Current Status
✅ ngrok tunnel is ACTIVE and running

## Public URL
**https://majestic-mariam-unpsychologically.ngrok-free.dev**

This URL forwards to: `http://localhost:3000`

## ngrok Details
- Account: barekegna@gmail.com
- Plan: Free
- Region: India (in)
- Version: 3.36.1
- Web Interface: http://127.0.0.1:4040 (view requests/responses)

## Running Services
1. ✅ Dev Server: `http://localhost:3000` (Terminal 1)
2. ✅ Firebase Emulators (Terminal 5)
   - Firestore: `127.0.0.1:8080`
   - Auth: `127.0.0.1:9099`
   - Storage: `127.0.0.1:9199`
   - UI: `http://127.0.0.1:4000`
3. ✅ ngrok Tunnel: `https://majestic-mariam-unpsychologically.ngrok-free.dev` (Terminal 8)

## Next Steps: Create Telegram Bot

### 1. Open Telegram and Find @BotFather
- Search for `@BotFather` in Telegram
- Start a chat with BotFather

### 2. Create a New Bot
Send this command to BotFather:
```
/newbot
```

Follow the prompts:
- **Bot name**: Choose a display name (e.g., "Misrak Shemeta Marketplace")
- **Bot username**: Choose a unique username ending in "bot" (e.g., "misrak_shemeta_bot")

BotFather will give you a **Bot Token** - save this token securely!

### 3. Set Bot Menu Button (Mini App)
Send this command to BotFather:
```
/setmenubutton
```

Then:
1. Select your bot from the list
2. Choose "Edit menu button URL"
3. Enter your ngrok URL: `https://majestic-mariam-unpsychologically.ngrok-free.dev`
4. Enter button text: "Open Marketplace" (or your preferred text)

### 4. Test Your Mini App
1. Open your bot in Telegram
2. Click the menu button (bottom left, next to message input)
3. Your marketplace should open inside Telegram!

### 5. Get User Telegram IDs for Testing
When users open your mini app, you can get their Telegram ID from the Telegram WebApp API.

For testing, you can use these test accounts from seed data:
- Admin: `123456789`
- Merchant 1: `111111111`
- Merchant 2: `222222222`
- Buyer 1: `333333333`
- Runner: `444444444`

## Important Notes

### ngrok Free Plan Limitations
- URL changes every time you restart ngrok
- If you restart ngrok, you'll need to update the bot menu button URL in BotFather
- For production, use a paid ngrok plan or deploy to Vercel/Netlify

### Testing Tips
1. Test all user roles (buyer, merchant, runner, admin)
2. Test on mobile device for best experience
3. Check ngrok web interface (http://127.0.0.1:4040) to see all requests
4. Monitor Firebase Emulator UI (http://127.0.0.1:4000) for data changes

### Stopping ngrok
When you're done testing:
- Press `Ctrl+C` in the ngrok terminal to stop the tunnel
- The URL will become inactive

## Troubleshooting

### If ngrok URL doesn't work:
1. Check that dev server is running on port 3000
2. Check that Firebase emulators are running
3. Visit http://127.0.0.1:4040 to see ngrok request logs
4. Try accessing the ngrok URL in a regular browser first

### If Telegram Mini App doesn't load:
1. Make sure you used the correct ngrok URL in BotFather
2. Check that the URL starts with `https://` (not `http://`)
3. Try closing and reopening the bot in Telegram
4. Check ngrok logs for any errors

## Environment Variables
Make sure `.env.local` has:
```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

Update this after creating your bot!
