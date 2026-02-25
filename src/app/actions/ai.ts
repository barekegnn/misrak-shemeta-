'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import { detectLanguage, queryOpenAI, getFallbackMessage, isOpenAIConfigured } from '@/lib/ai/openai';
import type { ActionResponse, Language } from '@/types';

/**
 * Query AI Sales Assistant with RAG
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7
 */
export async function queryAIAssistant(
  telegramId: string,
  question: string
): Promise<ActionResponse<{ answer: string; language: Language }>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return {
        success: false,
        error: 'AI_NOT_CONFIGURED',
        data: {
          answer: 'AI Assistant is not configured. Please set OPENAI_API_KEY.',
          language: 'en'
        }
      };
    }

    // Validate question
    if (!question || question.trim().length === 0) {
      return { success: false, error: 'EMPTY_QUESTION' };
    }

    if (question.length > 500) {
      return { success: false, error: 'QUESTION_TOO_LONG' };
    }

    // Detect language from user question (Requirement 20.6)
    const detectedLanguage = detectLanguage(question);

    // Retrieve relevant products from Firestore (RAG context)
    // Search for products matching keywords in the question
    const keywords = extractKeywords(question);
    const productsSnapshot = await adminDb
      .collection('products')
      .where('stock', '>', 0) // Only available products
      .limit(10) // Limit to top 10 products
      .get();

    // Enrich products with shop information
    const products = await Promise.all(
      productsSnapshot.docs.map(async (doc) => {
        const productData = doc.data();
        
        // Get shop information
        const shopDoc = await adminDb
          .collection('shops')
          .doc(productData.shopId)
          .get();
        
        const shopData = shopDoc.data();

        return {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          shopName: shopData?.name || 'Unknown Shop',
          shopCity: shopData?.city || 'Unknown',
          stock: productData.stock
        };
      })
    );

    // Filter products by relevance to question
    const relevantProducts = filterRelevantProducts(products, keywords);

    // If no relevant products found, use all products
    const contextProducts = relevantProducts.length > 0 ? relevantProducts : products.slice(0, 5);

    try {
      // Query OpenAI with RAG context (Requirement 20.2, 20.3)
      const answer = await queryOpenAI(question, contextProducts, detectedLanguage);

      return {
        success: true,
        data: {
          answer,
          language: detectedLanguage
        }
      };
    } catch (error) {
      // Return fallback message on error (Requirement 20.5)
      console.error('OpenAI query failed:', error);
      
      return {
        success: true, // Still return success with fallback
        data: {
          answer: getFallbackMessage(detectedLanguage),
          language: detectedLanguage
        }
      };
    }
  } catch (error) {
    console.error('Error in AI assistant:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Extract keywords from question for product matching
 */
function extractKeywords(question: string): string[] {
  // Remove common words and extract meaningful keywords
  const commonWords = new Set([
    'what', 'where', 'when', 'how', 'why', 'who', 'which', 'the', 'a', 'an',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may',
    'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this',
    'that', 'these', 'those', 'am', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'from', 'by', 'about', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once'
  ]);

  const words = question
    .toLowerCase()
    .replace(/[^\w\s\u1200-\u137F]/g, ' ') // Keep alphanumeric and Ethiopic script
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  return words;
}

/**
 * Filter products by relevance to keywords
 */
function filterRelevantProducts(
  products: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
    shopName: string;
    shopCity: string;
    stock: number;
  }>,
  keywords: string[]
): typeof products {
  if (keywords.length === 0) {
    return products;
  }

  return products
    .map(product => {
      // Calculate relevance score
      let score = 0;
      const searchText = `${product.name} ${product.description} ${product.category}`.toLowerCase();

      keywords.forEach(keyword => {
        if (searchText.includes(keyword)) {
          score += 1;
          // Bonus for keyword in name
          if (product.name.toLowerCase().includes(keyword)) {
            score += 2;
          }
        }
      });

      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.product);
}

/**
 * Get AI Assistant status
 */
export async function getAIAssistantStatus(
  telegramId: string
): Promise<ActionResponse<{ available: boolean; message?: string }>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const available = isOpenAIConfigured();

    return {
      success: true,
      data: {
        available,
        message: available
          ? 'AI Assistant is ready to help!'
          : 'AI Assistant is not configured. Please contact support.'
      }
    };
  } catch (error) {
    console.error('Error checking AI status:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
