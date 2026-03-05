/**
 * Debug endpoint to check products in database
 */

import { adminDb } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const productsSnapshot = await adminDb.collection('products').get();
    
    const products = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        shopId: data.shopId,
        shopCity: data.shopCity,
        category: data.category,
        price: data.price,
        stock: data.stock,
        hasImages: data.images && data.images.length > 0,
      };
    });

    return NextResponse.json({
      total: products.length,
      products,
      groupedByCity: {
        Harar: products.filter(p => p.shopCity === 'Harar').length,
        'Dire Dawa': products.filter(p => p.shopCity === 'Dire Dawa').length,
        undefined: products.filter(p => !p.shopCity).length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
