import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking products in database...');

    // Get all products
    const productsSnapshot = await adminDb
      .collection('products')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const products = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        shopId: data.shopId,
        images: data.images,
        price: data.price,
        stock: data.stock,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      };
    });

    console.log(`Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Shop ID: ${product.shopId}`);
      console.log(`   Images: ${JSON.stringify(product.images)}`);
      console.log(`   Price: ${product.price} ETB`);
      console.log('');
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProducts: products.length,
        products
      }
    });

  } catch (error) {
    console.error('Error checking products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check products' },
      { status: 500 }
    );
  }
}