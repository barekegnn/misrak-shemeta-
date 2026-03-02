# Telegram Bot Setup - Quick Test with ngrok

## Current Status
✅ ngrok tunnel running: **https://majestic-mariam-unpsychologically.ngrok-free.dev**

## Step-by-Step Bot Creation

### Step 1: Open Telegram and Find BotFather
1. Open Telegram on your phone or desktop
2. Search for: `@BotFather`
3. Start a chat with BotFather (click START)

### Step 2: Create a New Bot
Send this command to BotFather:
```
/newbot
```

BotFather will ask you two questions:

**Question 1: "Alright, a new bot. How are we going to call it?"**
- Answer: `Misrak Shemeta Test` (or any name you prefer for testing)
- This is the display name users will see

**Question 2: "Good. Now let's choose a username for your bot."**
- Answer: `misrak_shemeta_test_bot` (or similar - must end with "bot")
- This must be unique across all Telegram
- If taken, try: `misrak_shemeta_dev_bot` or `your_name_misrak_bot`

**BotFather will respond with:**
- ✅ Success message
- 🔑 **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
- ⚠️ **SAVE THIS TOKEN** - you'll need it later for production

### Step 3: Set Up Mini App Menu Button
Send this command to BotFather:
```
/setmenubutton
```

BotFather will show you a list of your bots:
1. **Select your bot** from the list (click on it)

BotFather will ask: "Send me the text for the menu button"
2. **Type**: `Open Marketplace` (or `🛍️ Shop Now` or any text you prefer)

BotFather will ask: "Now send me the URL for the Web App"
3. **Copy and paste your ngrok URL**:
```
https://majestic-mariam-unpsychologically.ngrok-free.dev
```

✅ BotFather will confirm: "Success! Menu button updated."

### Step 4: Test Your Mini App
1. **Find your bot** in Telegram (search for the username you created)
2. **Open the chat** with your bot
3. **Look at the bottom** of the chat (where you type messages)
4. **You'll see a button** (looks like a keyboard icon or menu icon) next to the message input
5. **Click that button** → Your marketplace should open inside Telegram!

## What You Should See

When you click the menu button:
- A web view opens inside Telegram
- Your Misrak Shemeta marketplace loads
- You can browse products, add to cart, etc.
- Everything works like a normal web app, but inside Telegram

## Testing Checklist

Test these features in the Telegram Mini App:

### Buyer Flow
- [ ] Browse products from all shops
- [ ] Filter by location (Harar/Dire Dawa)
- [ ] Search for products
- [ ] Add products to cart
- [ ] View cart
- [ ] Proceed to checkout
- [ ] See delivery fee calculation

### Merchant Flow
- [ ] Access merchant dashboard at `/merchant`
- [ ] View shop products
- [ ] Add new product
- [ ] Edit product
- [ ] Delete product
- [ ] View orders

### Admin Flow
- [ ] Access admin dashboard at `/admin`
- [ ] View platform statistics
- [ ] Manage users
- [ ] Manage shops
- [ ] View orders

## Important Notes

### About ngrok Free Plan
- ⚠️ The URL changes every time you restart ngrok
- ⚠️ If you restart ngrok, you'll need to update the bot menu button URL again
- ⚠️ This is ONLY for testing - not for production

### For Production
When ready to deploy for real:
1. Deploy to Vercel (permanent URL)
2. Create a new production bot (professional name)
3. Set the menu button to your Vercel URL
4. That bot becomes your permanent marketplace launcher

### Telegram Mini App Context
The app will automatically detect:
- User's Telegram ID (for authentication)
- User's language preference
- User's first name, last name
- This data comes from Telegram's WebApp SDK

### Current Test Data
You can test with these accounts (from seed data):
- **Admin**: Telegram ID `123456789`
- **Merchant 1**: Telegram ID `111111111` (Harar Electronics)
- **Merchant 2**: Telegram ID `222222222` (Dire Dawa Shoes)
- **Buyer 1**: Telegram ID `333333333`
- **Runner**: Telegram ID `444444444`

## Troubleshooting

### If the Mini App doesn't load:
1. Check that ngrok is still running (Terminal 8)
2. Check that dev server is running (Terminal 1)
3. Check that Firebase emulators are running (Terminal 5)
4. Try the ngrok URL in a regular browser first
5. Check ngrok web interface: http://127.0.0.1:4040

### If you see "ngrok free plan" warning page:
- This is normal for ngrok free plan
- Click "Visit Site" to continue
- The warning appears once per session

### If authentication fails:
- The app expects Telegram context
- For now, it will use fallback authentication
- Full Telegram auth integration is in the code but needs production deployment

## Next Steps After Testing

Once you've tested and confirmed everything works:
1. Stop ngrok (Ctrl+C in Terminal 8)
2. Deploy to Vercel for production
3. Create official production bot
4. Update bot menu button with Vercel URL
5. Launch to real users!

## Questions?

If you encounter any issues during setup, let me know:
- What step you're on
- What error message you see
- Screenshot if helpful
