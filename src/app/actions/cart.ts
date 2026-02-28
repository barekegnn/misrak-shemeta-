'use server';

import { adminDb, FieldValue } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import { Cart, CartItem, ActionResponse, Product } from '@/types';

/**
 * Adds a product to the user's cart.
 * If the product already exists in cart, updates the quantity.
 * 
 * SECURITY: Verifies telegramId before processing.
 * 
 * Requirements: 6.1
 */
export async function addToCart(
  telegramId: string,
  productId: string,
  quantity: number
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Validate quantity
    if (quantity <= 0) {
      return {
        success: false,
        error: 'Quantity must be greater than 0',
      };
    }

    // 3. Verify product exists and has sufficient stock
    const productDoc = await adminDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const product = productDoc.data()!;
    if (product.stock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock available',
      };
    }

    // 4. Get or create cart
    const cartRef = adminDb.collection('carts').doc(user.id);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Create new cart
      await cartRef.set({
        items: [{ productId, quantity }],
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Update existing cart
      const cartData = cartDoc.data()!;
      const items: CartItem[] = cartData.items || [];
      
      // Check if product already in cart
      const existingItemIndex = items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        items[existingItemIndex].quantity += quantity;
        
        // Check if new quantity exceeds stock
        if (items[existingItemIndex].quantity > product.stock) {
          return {
            success: false,
            error: 'Cannot add more items than available stock',
          };
        }
      } else {
        // Add new item
        items.push({ productId, quantity });
      }

      await cartRef.update({
        items,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      success: false,
      error: 'Failed to add item to cart',
    };
  }
}

/**
 * Updates the quantity of a cart item.
 * 
 * SECURITY: Verifies telegramId before processing.
 * 
 * Requirements: 6.2
 */
export async function updateCartItem(
  telegramId: string,
  productId: string,
  quantity: number
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Validate quantity
    if (quantity <= 0) {
      return {
        success: false,
        error: 'Quantity must be greater than 0',
      };
    }

    // 3. Verify product exists and has sufficient stock
    const productDoc = await adminDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const product = productDoc.data()!;
    if (product.stock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock available',
      };
    }

    // 4. Get cart
    const cartRef = adminDb.collection('carts').doc(user.id);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return {
        success: false,
        error: 'Cart not found',
      };
    }

    // 5. Update item quantity
    const cartData = cartDoc.data()!;
    const items: CartItem[] = cartData.items || [];
    
    const itemIndex = items.findIndex(item => item.productId === productId);
    
    if (itemIndex < 0) {
      return {
        success: false,
        error: 'Item not found in cart',
      };
    }

    items[itemIndex].quantity = quantity;

    await cartRef.update({
      items,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    return {
      success: false,
      error: 'Failed to update cart item',
    };
  }
}

/**
 * Removes a product from the user's cart.
 * 
 * SECURITY: Verifies telegramId before processing.
 * 
 * Requirements: 6.3
 */
export async function removeFromCart(
  telegramId: string,
  productId: string
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Get cart
    const cartRef = adminDb.collection('carts').doc(user.id);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return {
        success: false,
        error: 'Cart not found',
      };
    }

    // 3. Remove item
    const cartData = cartDoc.data()!;
    const items: CartItem[] = cartData.items || [];
    
    const filteredItems = items.filter(item => item.productId !== productId);

    await cartRef.update({
      items: filteredItems,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      error: 'Failed to remove item from cart',
    };
  }
}

/**
 * Gets the user's cart with enriched product details.
 * 
 * SECURITY: Verifies telegramId before processing.
 * 
 * Requirements: 6.5
 */
export async function getCart(
  telegramId: string
): Promise<ActionResponse<Cart & { enrichedItems: Array<CartItem & { product: Product }> }>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Get cart
    const cartRef = adminDb.collection('carts').doc(user.id);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Return empty cart
      return {
        success: true,
        data: {
          id: user.id,
          items: [],
          enrichedItems: [],
          updatedAt: new Date(),
        },
      };
    }

    const cartData = cartDoc.data()!;
    const items: CartItem[] = cartData.items || [];

    // 3. Enrich cart items with product details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const productDoc = await adminDb.collection('products').doc(item.productId).get();
        
        if (!productDoc.exists) {
          // Product no longer exists, skip it
          return null;
        }

        const productData = productDoc.data()!;
        const product: Product = {
          id: productDoc.id,
          shopId: productData.shopId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          images: productData.images,
          stock: productData.stock,
          createdAt: productData.createdAt.toDate(),
          updatedAt: productData.updatedAt.toDate(),
        };

        return {
          ...item,
          product,
        };
      })
    );

    // Filter out null values (deleted products)
    const validEnrichedItems = enrichedItems.filter(item => item !== null) as Array<CartItem & { product: Product }>;

    const cart: Cart = {
      id: user.id,
      items,
      updatedAt: cartData.updatedAt.toDate(),
    };

    return {
      success: true,
      data: {
        ...cart,
        enrichedItems: validEnrichedItems,
      },
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    return {
      success: false,
      error: 'Failed to get cart',
    };
  }
}

/**
 * Calculates the total price of all items in the cart.
 * Does not include delivery fee (calculated at checkout).
 * 
 * Requirements: 6.4
 */
export async function calculateCartTotal(
  telegramId: string
): Promise<ActionResponse<number>> {
  try {
    // 1. Get cart with enriched items
    const cartResult = await getCart(telegramId);
    
    if (!cartResult.success || !cartResult.data) {
      return {
        success: false,
        error: cartResult.error || 'Failed to get cart',
      };
    }

    // 2. Calculate total
    const total = cartResult.data.enrichedItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    return {
      success: true,
      data: total,
    };
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return {
      success: false,
      error: 'Failed to calculate cart total',
    };
  }
}

/**
 * Clears all items from the user's cart.
 * Typically called after successful order creation.
 * 
 * SECURITY: Verifies telegramId before processing.
 */
export async function clearCart(
  telegramId: string
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Clear cart
    const cartRef = adminDb.collection('carts').doc(user.id);
    await cartRef.update({
      items: [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      success: false,
      error: 'Failed to clear cart',
    };
  }
}
