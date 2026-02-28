import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramUser } from '@/lib/auth/telegram';

export async function POST(request: NextRequest) {
  try {
    const { telegramId, languageCode } = await request.json();

    console.log('[Auth Verify] Request received:', { telegramId, languageCode });

    if (!telegramId) {
      console.error('[Auth Verify] Missing telegramId');
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      );
    }

    const user = await verifyTelegramUser(telegramId, languageCode);

    if (!user) {
      console.error('[Auth Verify] Failed to verify user:', telegramId);
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 401 }
      );
    }

    console.log('[Auth Verify] User verified successfully:', user.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error('[Auth Verify] Error in auth verify route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
