# Telegram Bot Promotional Welcome Messages

## Overview

Your Telegram bot now displays rich, promotional welcome messages when users start the bot with `/start` command. The messages are automatically translated to the user's preferred language (English, Amharic, or Afaan Oromo).

## Features Implemented

### 1. Automatic Language Detection
- Detects user's language from Telegram's `language_code` setting
- Supports three languages:
  - **English** (en)
  - **Amharic** (am) - አማርኛ
  - **Afaan Oromo** (om)
- Falls back to English if language not detected

### 2. Promotional Welcome Message (`/start`)

#### English Version
```
👋 Welcome to Misrak Shemeta! 🛍️

Your Gateway to Eastern Ethiopia's Marketplace

🎯 Why Choose Misrak Shemeta?
  🛍️ 500+ Products from trusted sellers in Harar & Dire Dawa
  🚚 Fast Delivery to your campus or city (30 min - 6 hours)
  💰 Secure Payments with Chapa - no hidden fees
  🔒 Buyer Protection with escrow - funds held until delivery
  ⭐ Trusted by Students across Haramaya, Harar, and DDU
  📱 Easy to Use - shop directly from Telegram

💡 What You Get:
  ✓ Shop from your favorite sellers
  ✓ Track orders in real-time
  ✓ Secure payment with buyer protection
  ✓ 24/7 customer support

🔒 All transactions are secured by Chapa. Your payment is protected.

🚀 Ready to start shopping?
Click the button below to open the marketplace and explore thousands of products!
```

#### Amharic Version (አማርኛ)
```
👋 ወደ ሚሳ ሸመታ እንኳን ደህና መጡ! 🛍️

ምስራቅ ኢትዮጵያ ገበያ ወደ ሚሳ ሸመታ

🎯 ሚሳ ሸመታ ለምን ይምረጡ?
  🛍️ 500+ ምርቶች ከሐረር እና ከደሬ ዳዋ ታማኝ ሻጮች
  🚚 ፈጣን ማድረስ ወደ ካምፓስ ወይም ከተማ (30 ደቂቃ - 6 ሰዓት)
  💰 ደህንነቱ የተጠበቀ ክፍያ ከቻፓ - ምንም ተደብቅ ክፍያ የለም
  🔒 ገዢ ጥበቃ ከ escrow ጋር - ገንዘብ እስከ ማድረስ ድረስ ይቆያል
  ⭐ ተማሪዎች ያምናሉ በሐረር፣ በሐረር ካምፓስ እና በደሬ ዳዋ ዩኒቨርሲቲ
  📱 ለመጠቀም ቀላል - በቴሌግራም ውስጥ ይገዙ

💡 ምን ታገኛለህ:
  ✓ ከወደዱት ሻጮች ይገዙ
  ✓ ትዕዛዞችን በእውነተኛ ጊዜ ይከታተሉ
  ✓ ገዢ ጥበቃ ያለው ደህንነቱ የተጠበቀ ክፍያ
  ✓ 24/7 ደንበኛ ድጋፍ

🔒 ሁሉም ግብይቶች በ Chapa ተጠብቀዋል። ክፍያህ ተጠብቆ ነው።

🚀 ገዝ ጀምር?
ከታች ያለውን ቁልፍ ይጫኑ ገበያ ክፈት!
```

#### Afaan Oromo Version
```
👋 Gara Misrak Shemeta akam galateeffadha! 🛍️

Karaa Gara Gabaa Bahaasaa Baab'a Itoophiyaa

🎯 Misrak Shemeta Maaliif Filadhu?
  🛍️ 500+ Midhaa irraa gurgurtoota amansiisaa Haarar fi Dire Daawaa
  🚚 Geessaa Saffisaa gara kampasaa ykn magaalaa (30 daqiiqaa - 6 saatii)
  💰 Kaffaltii Nageenya Qabu Chapa waliin - kaffaltii dhoksaa hin jiru
  🔒 Eegumsa Bitaa escrow waliin - maallaqa hanga geessaa itti qabama
  ⭐ Barattoonni Amansiisu Haarar, Haramaya, fi DDU keessatti
  📱 Itti Fayyadamuu Salphaa - Telegram keessatti bitaa

💡 Maal Argachuu Dandeessa:
  ✓ Irraa gurgurtoota jaarmaa keessanitti bitaa
  ✓ Gadii yeroo dhumaatiif hordofu
  ✓ Kaffaltii nageenya qabu eegumsa bitaa waliin
  ✓ Deeggarsa daldala 24/7

🔒 Miidhaagni hundinuu Chapa waliin eegamaa jira. Kaffaltiin kee eegamaa jira.

🚀 Bitaa Jalqabi?
Buuton armaan gadii cuuqaa gabaa banaa!
```

### 3. Bot Commands with Promotional Messages

#### `/start` - Welcome Message
- Displays promotional welcome with marketplace benefits
- Shows inline button to open marketplace
- Includes direct link option

#### `/help` - Available Commands
- Lists all available commands
- Provides quick reference in user's language
- Includes marketplace link

#### `/shop` - Browse Shops
- Promotional message about browsing shops
- Lists popular shop categories
- Direct link to marketplace

#### `/products` - Browse Products
- Promotional message about browsing products
- Highlights product benefits
- Direct link to marketplace

### 4. Inline Buttons
Each message includes inline buttons:
- **🛍️ Open Marketplace** - Opens Mini App via web_app
- **📱 Direct Link** - Opens marketplace in browser

## Technical Implementation

### File Structure
```
src/
├── lib/
│   └── bot/
│       └── messages.ts          # Promotional message templates
└── app/
    └── api/
        └── webhooks/
            └── telegram/
                └── route.ts     # Updated webhook handler
```

### Message Generation Functions

#### `generateWelcomeMessage(firstName, language)`
Generates the main welcome message with:
- Personalized greeting with user's first name
- Compelling headline
- 6 key features
- 4 main benefits
- Security assurance

#### `generateHelpMessage(language)`
Generates help message with available commands

#### `generateShopMessage(language)`
Generates shop browsing promotional message

#### `generateProductsMessage(language)`
Generates product browsing promotional message

### Language Detection Flow
```
User sends /start
    ↓
Extract language_code from Telegram user object
    ↓
Map to supported language (en, am, om)
    ↓
Generate message in that language
    ↓
Send to user with inline buttons
```

## User Experience Flow

### First-Time User (English)
1. User starts bot with `/start`
2. Bot detects language_code = 'en'
3. Bot sends promotional welcome in English
4. User sees:
   - Personalized greeting with their name
   - 6 compelling features
   - 4 main benefits
   - Security assurance
   - Two buttons: "Open Marketplace" and "Direct Link"

### First-Time User (Amharic)
1. User starts bot with `/start`
2. Bot detects language_code = 'am'
3. Bot sends promotional welcome in Amharic
4. User sees same content in Ethiopic script (አማርኛ)

### First-Time User (Afaan Oromo)
1. User starts bot with `/start`
2. Bot detects language_code = 'om'
3. Bot sends promotional welcome in Afaan Oromo
4. User sees same content in Oromo language

## Customization

### Adding New Languages
Edit `src/lib/bot/messages.ts`:

```typescript
export const botMessages: Record<string, BotMessage> = {
  en: { /* ... */ },
  am: { /* ... */ },
  om: { /* ... */ },
  // Add new language here
  fr: {
    greeting: '👋 Bienvenue sur <b>Misrak Shemeta</b>! 🛍️',
    headline: '<b>Votre Passerelle vers le Marché de l\'Éthiopie Orientale</b>',
    // ... rest of content
  },
};
```

### Customizing Messages
Edit the content in `botMessages` object:
- `greeting` - Welcome greeting
- `headline` - Main headline
- `features` - Array of 6 features
- `cta` - Call-to-action button text
- `benefits` - Array of 4 benefits
- `security` - Security assurance message
- `commands` - Available commands reference

## Deployment

✅ **Live on Vercel** - Changes deployed and active

### Testing the Bot

1. **Start the bot**
   - Open Telegram
   - Search for your bot
   - Send `/start` command

2. **Test language detection**
   - Change Telegram language settings
   - Send `/start` again
   - Verify message appears in correct language

3. **Test commands**
   - Send `/help` - See available commands
   - Send `/shop` - See shop browsing message
   - Send `/products` - See product browsing message

4. **Test buttons**
   - Click "🛍️ Open Marketplace" - Opens Mini App
   - Click "📱 Direct Link" - Opens in browser

## Commit Hash
`b2df62a` - feat: add promotional welcome messages for telegram bot /start command

## Next Steps

1. Test with actual Telegram users
2. Monitor bot engagement metrics
3. Gather user feedback on messaging
4. A/B test different copy variations
5. Optimize based on conversion data
6. Consider adding more languages based on user demand

## Files Modified
- `src/app/api/webhooks/telegram/route.ts` - Updated webhook handler
- `src/lib/bot/messages.ts` - New promotional messages file

## Build Status
✅ **Passing** - No TypeScript errors, all tests passing
