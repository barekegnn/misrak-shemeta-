/**
 * Telegram Bot Promotional Messages
 * 
 * Premium multilingual welcome messages for the /start command
 * Supports: English, Amharic, Afaan Oromo
 * 
 * Features:
 * - Personalized greeting with student's first name
 * - Premium copywriting with brand identity (🌅 emoji)
 * - HTML formatting for rich text
 * - Language detection from Telegram settings
 */

export interface PremiumBotMessage {
  welcome: (studentName: string) => string;
  buttonText: string;
}

export interface LegacyBotMessage {
  greeting: string;
  headline: string;
  features: string[];
  cta: string;
  benefits: string[];
  security: string;
  commands: string;
}

/**
 * Premium welcome messages with personalization
 * Uses HTML formatting for rich text
 * Professional marketing copy from brand/sales team
 */
export const premiumWelcomeMessages: Record<string, (studentName: string) => string> = {
  en: (studentName: string) => `
🌅 <b>Welcome to Misrak Shemeta, ${studentName}!</b>

You just found your new favorite marketplace. We're the go-to spot for students across Haramaya, Dire Dawa, and Harar who want to buy and sell textbooks, electronics, and essentials without the stress.

<b>Here's what makes us different:</b>
✨ <b>Built for students, by students</b> – We get what you need
🔒 <b>Escrow protection</b> – Your money is safe until you get your stuff
⚡ <b>Lightning-fast delivery</b> – Get what you want in hours, not days
💯 <b>Trusted by thousands</b> – Join the community that's changing how students trade

Ready to find your next great deal? Let's go! 🚀
  `.trim(),

  am: (studentName: string) => `
🌅 <b>ወደ ሚሳ ሸመታ በደህና መጡ, ${studentName}!</b>

አሁን ወደ ምርጥ ገበያህ ደርሰሃል። ሚሳ ሸመታ በሐረር፣ በደሬ ዳዋ እና በሐረማያ ተማሪዎች መካከል መጻሕፍት፣ ኤሌክትሮኒክስ እና ሌሎች አስፈላጊ ነገሮችን ለመግዛት እና ለመሸጥ ምቹ ቦታ ነው።

<b>ለምን ሚሳ ሸመታ?</b>
✨ <b>ተማሪዎች ለተማሪዎች</b> – ምን ትፈልጋለህ እንደምናውቅ
🔒 <b>ደህንነቱ የተጠበቀ ክፍያ</b> – ገንዘብህ እስከ ምርቱ ደርሰህ ድረስ ተጠብቆ ይሆናል
⚡ <b>ፈጣን ማድረስ</b> – ምን ትፈልገው በሰዓታት ውስጥ ታገኛለህ
💯 <b>ሺህ ሺህ ተማሪዎች ያምናሉ</b> – ተማሪዎች ንግድ ለመቀየር ወደ ሚሳ ሸመታ ይመጣሉ

ምርጥ ዕቃ ለማግኘት ዝግጁ? እንሂድ! 🚀
  `.trim(),

  om: (studentName: string) => `
🌅 <b>Gara Misrak Shemeta akam galateeffadha, ${studentName}!</b>

Gabaa barattootaaf kan qophaa'e argadhe. Misrak Shemeta gabaa amansiisaa barattoota Haramayaa, Dirree Dhawaa fi Harar jidduutti meeshaalee barumsaa, elektironiksii fi waan isiniif barbaachisu hunda daldaluuf kan qophaa'edha.

<b>Misrak Shemeta maaliif filadhu?</b>
✨ <b>Barattoonni barattootaaf</b> – Maal barbaachdu akka hubnu
🔒 <b>Kaffaltii amansiisaa</b> – Maallaqa kee hanga midhaa argachuu itti qabama
⚡ <b>Geessaa saffisaa</b> – Waan barbaachdu sa'aatii keessatti argadha
💯 <b>Kuma kuma barattoonni amansiisu</b> – Misrak Shemeta gara daldalaa jijjiiruuf dhufu

Midhaa gaarii argachuuf qophaa? Haa deemnu! 🚀
  `.trim(),
};

/**
 * Button text in three languages - with marketing flair
 */
export const buttonTexts: Record<string, string> = {
  en: '🚀 Let\'s Shop',
  am: '🚀 ገበያ ክፈት',
  om: '🚀 Gabaa Banaa',
};

/**
 * Legacy bot messages (kept for backward compatibility)
 */
export const botMessages: Record<string, LegacyBotMessage> = {
  en: {
    greeting: '👋 Welcome to <b>Misrak Shemeta</b>! 🛍️',
    headline: '<b>Your Gateway to Eastern Ethiopia\'s Marketplace</b>',
    features: [
      '🛍️ <b>500+ Products</b> from trusted sellers in Harar & Dire Dawa',
      '🚚 <b>Fast Delivery</b> to your campus or city (30 min - 6 hours)',
      '💰 <b>Secure Payments</b> with Chapa - no hidden fees',
      '🔒 <b>Buyer Protection</b> with escrow - funds held until delivery',
      '⭐ <b>Trusted by Students</b> across Haramaya, Harar, and DDU',
      '📱 <b>Easy to Use</b> - shop directly from Telegram',
    ],
    cta: '🛍️ Open Marketplace',
    benefits: [
      '✓ Shop from your favorite sellers',
      '✓ Track orders in real-time',
      '✓ Secure payment with buyer protection',
      '✓ 24/7 customer support',
    ],
    security: '🔒 All transactions are secured by Chapa. Your payment is protected.',
    commands: `
<b>📋 Available Commands:</b>
/start - Welcome & open marketplace
/help - Show available commands
/shop - Browse shops
/products - Browse products
/orders - View your orders
    `.trim(),
  },
  am: {
    greeting: '👋 ወደ <b>ሚሳ ሸመታ</b> እንኳን ደህና መጡ! 🛍️',
    headline: '<b>ምስራቅ ኢትዮጵያ ገበያ ወደ ሚሳ ሸመታ</b>',
    features: [
      '🛍️ <b>500+ ምርቶች</b> ከሐረር እና ከደሬ ዳዋ ታማኝ ሻጮች',
      '🚚 <b>ፈጣን ማድረስ</b> ወደ ካምፓስ ወይም ከተማ (30 ደቂቃ - 6 ሰዓት)',
      '💰 <b>ደህንነቱ የተጠበቀ ክፍያ</b> ከቻፓ - ምንም ተደብቅ ክፍያ የለም',
      '🔒 <b>ገዢ ጥበቃ</b> ከ escrow ጋር - ገንዘብ እስከ ማድረስ ድረስ ይቆያል',
      '⭐ <b>ተማሪዎች ያምናሉ</b> በሐረር፣ በሐረር ካምፓስ እና በደሬ ዳዋ ዩኒቨርሲቲ',
      '📱 <b>ለመጠቀም ቀላል</b> - በቴሌግራም ውስጥ ይገዙ',
    ],
    cta: '🛍️ ገበያ ክፈት',
    benefits: [
      '✓ ከወደዱት ሻጮች ይገዙ',
      '✓ ትዕዛዞችን በእውነተኛ ጊዜ ይከታተሉ',
      '✓ ገዢ ጥበቃ ያለው ደህንነቱ የተጠበቀ ክፍያ',
      '✓ 24/7 ደንበኛ ድጋፍ',
    ],
    security: '🔒 ሁሉም ግብይቶች በ Chapa ተጠብቀዋል። ክፍያህ ተጠብቆ ነው።',
    commands: `
<b>📋 ሊሰሩ የሚችሉ ትዕዛዞች:</b>
/start - ወደ ገበያ ደህና መጡ
/help - ሊሰሩ የሚችሉ ትዕዛዞች ይታይ
/shop - ሱቆችን ይመልከቱ
/products - ምርቶችን ይመልከቱ
/orders - ትዕዛዞችህን ይመልከት
    `.trim(),
  },
  om: {
    greeting: '👋 Gara <b>Misrak Shemeta</b> akam galateeffadha! 🛍️',
    headline: '<b>Karaa Gara Gabaa Bahaasaa Baab\'a Itoophiyaa</b>',
    features: [
      '🛍️ <b>500+ Midhaa</b> irraa gurgurtoota amansiisaa Haarar fi Dire Daawaa',
      '🚚 <b>Geessaa Saffisaa</b> gara kampasaa ykn magaalaa (30 daqiiqaa - 6 saatii)',
      '💰 <b>Kaffaltii Nageenya Qabu</b> Chapa waliin - kaffaltii dhoksaa hin jiru',
      '🔒 <b>Eegumsa Bitaa</b> escrow waliin - maallaqa hanga geessaa itti qabama',
      '⭐ <b>Barattoonni Amansiisu</b> Haarar, Haramaya, fi DDU keessatti',
      '📱 <b>Itti Fayyadamuu Salphaa</b> - Telegram keessatti bitaa',
    ],
    cta: '🛍️ Gabaa Banaa',
    benefits: [
      '✓ Irraa gurgurtoota jaarmaa keessanitti bitaa',
      '✓ Gadii yeroo dhumaatiif hordofu',
      '✓ Kaffaltii nageenya qabu eegumsa bitaa waliin',
      '✓ Deeggarsa daldala 24/7',
    ],
    security: '🔒 Miidhaagni hundinuu Chapa waliin eegamaa jira. Kaffaltiin kee eegamaa jira.',
    commands: `
<b>📋 Ajajawwan Fayyadamuu Dandeenyaa:</b>
/start - Gabaa keessatti akam galateeffadha
/help - Ajajawwan fayyadamuu dandeenyaa mul\'isu
/shop - Suuqota ilaalaa
/products - Midhaa ilaalaa
/orders - Gadii kee ilaalaa
    `.trim(),
  },
};

/**
 * Get bot message in specified language
 * Falls back to English if language not found
 */
export function getBotMessage(language: string = 'en'): LegacyBotMessage {
  return botMessages[language] || botMessages.en;
}

/**
 * Generate the welcome message for /start command
 */
export function generateWelcomeMessage(firstName: string, language: string = 'en'): string {
  const msg = getBotMessage(language);
  
  const featuresText = msg.features.map(f => `  ${f}`).join('\n');
  const benefitsText = msg.benefits.map(b => `  ${b}`).join('\n');

  return `
${msg.greeting}

${msg.headline}

<b>🎯 Why Choose Misrak Shemeta?</b>
${featuresText}

<b>💡 What You Get:</b>
${benefitsText}

${msg.security}

<b>🚀 Ready to start shopping?</b>
Click the button below to open the marketplace and explore thousands of products!
  `.trim();
}

/**
 * Generate help message with commands
 */
export function generateHelpMessage(language: string = 'en'): string {
  const msg = getBotMessage(language);
  return msg.commands;
}

/**
 * Generate shop browsing message
 */
export function generateShopMessage(language: string = 'en'): string {
  const msg = getBotMessage(language);
  
  if (language === 'am') {
    return `
🏪 <b>ሱቆችን ይመልከቱ</b>

ከሐረር እና ከደሬ ዳዋ ሁሉንም ሱቆች ለማየት ከታች ያለውን ቁልፍ ይጫኑ።

<b>ታዋቂ ሱቆች:</b>
✓ ምግብ እና መጠጦች
✓ ልብስ እና ጫማ
✓ ኤሌክትሮኒክስ
✓ ቤት እና ጋዜጣ

ሁሉንም ሱቆች ለማየት ገበያ ክፈት!
    `.trim();
  } else if (language === 'om') {
    return `
🏪 <b>Suuqota Ilaalaa</b>

Suuqota hundaa Haarar fi Dire Daawaa ilaalaaf buuton armaan gadii cuuqaa.

<b>Suuqota Beekamoo:</b>
✓ Nyaata fi dhugaatii
✓ Wayyaa fi kophee
✓ Elektirooniksii
✓ Mana fi wantoota biroo

Suuqota hundaa ilaaluuf gabaa banaa!
    `.trim();
  }

  return `
🏪 <b>Browse Shops</b>

Click the button below to open the marketplace and browse all available shops from Harar and Dire Dawa.

<b>Popular Shop Categories:</b>
✓ Food & Beverages
✓ Clothing & Shoes
✓ Electronics
✓ Home & Accessories

Open the marketplace to see all shops!
  `.trim();
}

/**
 * Generate products browsing message
 */
export function generateProductsMessage(language: string = 'en'): string {
  if (language === 'am') {
    return `
📦 <b>ምርቶችን ይመልከቱ</b>

ሁሉንም ሚሳ ሸመታ ምርቶች ለማየት ከታች ያለውን ቁልፍ ይጫኑ።

<b>ምርቶች በ:</b>
✓ ዝቅተኛ ዋጋ
✓ ከፍተኛ ደረጃ
✓ ፈጣን ማድረስ
✓ ታማኝ ሻጮች

ገበያ ክፈት!
    `.trim();
  } else if (language === 'om') {
    return `
📦 <b>Midhaa Ilaalaa</b>

Midhaa hundaa Misrak Shemeta ilaalaaf buuton armaan gadii cuuqaa.

<b>Midhaa:</b>
✓ Gatii Gadi
✓ Sadarkaa Ol'aanaa
✓ Geessaa Saffisaa
✓ Gurgurtoota Amansiisaa

Gabaa banaa!
    `.trim();
  }

  return `
📦 <b>Browse Products</b>

Click the button below to open the marketplace and browse all available products.

<b>Shop by:</b>
✓ Best Prices
✓ Top Rated
✓ Fast Delivery
✓ Trusted Sellers

Open the marketplace!
  `.trim();
}
