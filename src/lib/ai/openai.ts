/**
 * OpenAI API Integration for AI Sales Assistant
 * Requirements: 20.2, 20.3, 20.4, 20.5, 20.6, 20.7
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Detect language from user input
 * Requirements: 20.6, 20.7
 * 
 * Detects if user is speaking in Amharic, Afaan Oromo, or English
 */
export function detectLanguage(text: string): 'am' | 'om' | 'en' {
  // Check for Ethiopic script (Amharic)
  const ethiopicPattern = /[\u1200-\u137F]/;
  if (ethiopicPattern.test(text)) {
    return 'am';
  }

  // Check for common Afaan Oromo words/patterns
  const oromoKeywords = [
    'maal',
    'akkam',
    'oomisha',
    'gatii',
    'bitaa',
    'gurgurtaa',
    'dhugaa',
    'sababni',
    'yeroo',
    'bakka'
  ];
  
  const lowerText = text.toLowerCase();
  const hasOromoKeywords = oromoKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  if (hasOromoKeywords) {
    return 'om';
  }

  // Default to English
  return 'en';
}

/**
 * Query OpenAI with RAG context
 * Requirements: 20.2, 20.3, 20.4, 20.5
 * 
 * @param question - User's question
 * @param products - Relevant products from Firestore (RAG context)
 * @param language - Detected language
 * @returns AI-generated response
 */
export async function queryOpenAI(
  question: string,
  products: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
    shopName: string;
    shopCity: string;
    stock: number;
  }>,
  language: 'am' | 'om' | 'en'
): Promise<string> {
  try {
    // Construct RAG context from products
    const productsContext = products
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${p.description}\n` +
          `   Price: ${p.price} ETB\n` +
          `   Category: ${p.category}\n` +
          `   Shop: ${p.shopName} (${p.shopCity})\n` +
          `   Stock: ${p.stock > 0 ? 'Available' : 'Out of stock'}`
      )
      .join('\n\n');

    // Language-specific system prompts
    const systemPrompts = {
      en: `You are a helpful sales assistant for Misrak Shemeta, a marketplace connecting shops in Harar and Dire Dawa with students at Haramaya Main Campus, Harar Campus, and Dire Dawa University.

Your role is to help customers find products and answer questions about them. Be friendly, concise, and helpful.

Available products:
${productsContext}

Guidelines:
- Answer questions about product features, prices, availability, and shops
- If a product is out of stock, mention it and suggest alternatives
- Mention delivery fees: 40 ETB (intra-city), 100 ETB (city-to-campus), 180 ETB (inter-city)
- Keep responses concise (2-3 sentences)
- If you don't know something, suggest contacting the shop owner directly
- Always respond in English`,

      am: `እርስዎ ሚስራክ ሸመታ የሽያጭ ረዳት ነዎት። ሚስራክ ሸመታ በሐረር እና በድሬዳዋ ያሉ ሱቆችን ከሐረር ካምፓስ፣ ከሐረማያ ዋና ካምፓስ እና ከድሬዳዋ ዩኒቨርሲቲ ጋር የሚያገናኝ የገበያ መድረክ ነው።

የእርስዎ ሚና ደንበኞች ምርቶችን እንዲያገኙ እና ስለእነሱ ጥያቄዎችን እንዲመልሱ መርዳት ነው። ወዳጃዊ፣ አጭር እና ረዳት ይሁኑ።

የሚገኙ ምርቶች:
${productsContext}

መመሪያዎች:
- ስለምርት ባህሪያት፣ ዋጋዎች፣ መገኘት እና ሱቆች ጥያቄዎችን ይመልሱ
- ምርት ካለቀ፣ ይጥቀሱት እና አማራጮችን ይጠቁሙ
- የማድረሻ ክፍያዎችን ይጥቀሱ: 40 ብር (በከተማ ውስጥ)፣ 100 ብር (ከተማ-ወደ-ካምፓስ)፣ 180 ብር (በከተሞች መካከል)
- ምላሾችን አጭር ያድርጉ (2-3 ዓረፍተ ነገሮች)
- የማያውቁትን ነገር ካለ የሱቅ ባለቤትን በቀጥታ እንዲያነጋግሩ ይጠቁሙ
- ሁልጊዜ በአማርኛ ይመልሱ`,

      om: `Ati gargaaraa gurgurtaa Misrak Shemeta ti. Misrak Shemeta waltajjii gabaa suuqota Harar fi Dire Dawa keessa jiran waliin barattoota Haramaya Main Campus, Harar Campus, fi Dire Dawa University waliin walqunnamsiisudha.

Gaheen kee maamiloota oomisha akka argatan fi gaaffii waa'ee isaanii akka deebisan gargaaruudha. Michuu, gabaabaa fi gargaaraa ta'i.

Oomishaalee jiran:
${productsContext}

Qajeelfama:
- Gaaffilee waa'ee amala oomishaa, gatii, argamuu fi suuqota deebisi
- Yoo oomishni dhumee jiraate, eeradhu fi filannoo biraa yaada kenni
- Kaffaltii geejjibaa eeradhu: 40 ETB (magaalaa keessa), 100 ETB (magaalaa-gara-campus), 180 ETB (magaaloota gidduu)
- Deebii gabaabaa ta'u godhi (hima 2-3)
- Waan hin beekne yoo jiraate abbaa suuqii kallattiin akka quunnamaniif yaada kenni
- Yeroo hunda Afaan Oromoon deebisi`
    };

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout (Requirement 20.4)

    try {
      const completion = await openai.chat.completions.create(
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: systemPrompts[language]
            },
            {
              role: 'user',
              content: question
            }
          ],
          temperature: 0.7,
          max_tokens: 200 // Keep responses concise
        },
        {
          signal: controller.signal as any
        }
      );

      clearTimeout(timeoutId);

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        // Timeout - return fallback message (Requirement 20.5)
        return getFallbackMessage(language);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('OpenAI query error:', error);
    throw error;
  }
}

/**
 * Get fallback message when AI cannot answer
 * Requirement: 20.5
 */
export function getFallbackMessage(language: 'am' | 'om' | 'en'): string {
  const fallbackMessages = {
    en: "I'm having trouble answering that question right now. Please contact the shop owner directly for more information.",
    am: "ያንን ጥያቄ አሁን ለመመለስ እየተቸገርኩ ነው። እባክዎ ለተጨማሪ መረጃ የሱቅ ባለቤትን በቀጥታ ያነጋግሩ።",
    om: "Gaaffii sana deebisuu yeroo ammaa rakkoo qaba. Maaloo odeeffannoo dabalataa argachuuf abbaa suuqii kallattiin quunnamaa."
  };

  return fallbackMessages[language];
}

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;
}
