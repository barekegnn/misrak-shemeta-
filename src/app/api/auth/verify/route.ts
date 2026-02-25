import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramUser } from '@/lib/auth/telegram';

export async function POST(request: NextRequest) {
  try {
    const { telegramId, languageCode } = await request.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    const user = await verifyTelegramUser(telegramId, languageCode);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in auth verify route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
