import { NextRequest, NextResponse } from 'next/server';
import { uploadProductImage } from '@/lib/storage/images';

export async function POST(request: NextRequest) {
  try {
    const { shopId, productId, imageData, imageIndex, mimeType } = await request.json();

    // Validate required fields
    if (!shopId || !productId || !imageData || imageIndex === undefined || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload image
    const result = await uploadProductImage(
      shopId,
      productId,
      imageData,
      imageIndex,
      mimeType
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
