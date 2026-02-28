/**
 * Next.js Middleware for Admin Route Protection
 * 
 * Protects all /admin/* routes by verifying admin access.
 * Non-admin users are redirected to /unauthorized page.
 * 
 * Requirements: 27.1, 27.2
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function that runs on every request
 * 
 * Checks if the request is for an admin route and verifies admin access
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    try {
      // For local development, bypass authentication
      // In production, this should be removed and proper Telegram auth used
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // In development, allow access if ADMIN_TELEGRAM_IDS is configured
        const adminIdsString = process.env.ADMIN_TELEGRAM_IDS;
        if (adminIdsString && adminIdsString.trim().length > 0) {
          // Allow access in development mode
          return NextResponse.next();
        }
      }
      
      // Get telegramId from request
      // In a real Telegram Mini App, this would come from the Telegram context
      const telegramId = request.headers.get('x-telegram-id') || 
                        request.cookies.get('telegramId')?.value;
      
      if (!telegramId) {
        // No telegramId found, redirect to unauthorized
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // Verify admin access
      const isAdmin = await verifyAdminAccessInMiddleware(telegramId);
      
      if (!isAdmin) {
        // Not an admin, redirect to unauthorized
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // Admin verified, allow access
      return NextResponse.next();
    } catch (error) {
      console.error('Error in admin middleware:', error);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Not an admin route, allow access
  return NextResponse.next();
}

/**
 * Verifies admin access in middleware context
 * 
 * This is a simplified version that checks the ADMIN_TELEGRAM_IDS environment variable
 * without making database calls (for performance in middleware)
 * 
 * @param telegramId - The Telegram ID to verify
 * @returns boolean - True if user is admin, false otherwise
 */
function verifyAdminAccessInMiddleware(telegramId: string): boolean {
  try {
    const adminIdsString = process.env.ADMIN_TELEGRAM_IDS;
    
    if (!adminIdsString) {
      return false;
    }
    
    const adminIds = adminIdsString
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    return adminIds.includes(telegramId);
  } catch (error) {
    console.error('Error verifying admin access in middleware:', error);
    return false;
  }
}

/**
 * Middleware configuration
 * 
 * Specifies which routes the middleware should run on
 */
export const config = {
  matcher: [
    '/admin/:path*', // Match all admin routes
  ],
};
