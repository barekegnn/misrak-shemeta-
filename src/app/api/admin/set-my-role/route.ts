import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * API endpoint to update user role
 * Usage: GET /api/admin/set-my-role?telegramId=779028866&role=ADMIN
 */
export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');
    const newRole = searchParams.get('role');

    if (!telegramId || !newRole) {
      return NextResponse.json({
        error: 'Missing telegramId or role query parameters',
        usage: '/api/admin/set-my-role?telegramId=779028866&role=ADMIN'
      }, { status: 400 });
    }

    const validRoles = ['ADMIN', 'MERCHANT', 'RUNNER', 'STUDENT'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json({
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        logs
      }, { status: 400 });
    }

    log('[SetRole] ========== UPDATING USER ROLE ==========');
    log(`[SetRole] Telegram ID: ${telegramId}`);
    log(`[SetRole] New Role: ${newRole}`);

    // Find user by Telegram ID
    log('[SetRole] Step 1: Finding user...');
    const userQuery = await adminDb
      .collection('users')
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();

    if (userQuery.empty) {
      log('[SetRole] ERROR: User not found');
      log('[SetRole] Creating new user...');
      
      const userRef = await adminDb.collection('users').add({
        telegramId: telegramId,
        role: newRole,
        homeLocation: 'Haramaya_Main',
        languagePreference: 'en',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      log(`[SetRole] SUCCESS: User created with role ${newRole}`);
      log(`[SetRole] User ID: ${userRef.id}`);
      log('[SetRole] ========== ROLE UPDATE COMPLETE ==========');

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        userId: userRef.id,
        telegramId,
        role: newRole,
        logs
      });
    }

    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const currentRole = userDoc.data().role;

    log(`[SetRole] User found: ${userId}`);
    log(`[SetRole] Current role: ${currentRole}`);

    // Update role
    log('[SetRole] Step 2: Updating role...');
    await adminDb.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: new Date()
    });

    log(`[SetRole] SUCCESS: Role updated from ${currentRole} to ${newRole}`);
    log('[SetRole] ========== ROLE UPDATE COMPLETE ==========');

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      userId,
      telegramId,
      previousRole: currentRole,
      newRole: newRole,
      logs,
      nextSteps: [
        'Open your Telegram bot',
        'Send /start command',
        'Click "Open Marketplace" button',
        'The Mini App will detect your new role',
        'You will see the appropriate dashboard'
      ]
    });

  } catch (error) {
    log('[SetRole] ========== ROLE UPDATE FAILED ==========');
    log(`[SetRole] Exception: ${error instanceof Error ? error.message : 'Unknown'}`);
    if (error instanceof Error && error.stack) {
      log(`[SetRole] Stack: ${error.stack}`);
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      logs
    }, { status: 500 });
  }
}
