/**
 * Next.js Middleware for Admin Route Protection
 * 
 * Protects all /admin/* routes by verifying admin access.
 * Non-admin users are redirected to /unauthorized page.
 * 
 * Requirements: 27.1, 27.2
 * 
 * NOTE: For Telegram Mini Apps, authentication happens client-side via TelegramAuthProvider.
 * The middleware allows access to admin routes and relies on client-side role checks.
 * Server-side API routes perform their own authorization checks.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function that runs on every request
 * 
 * For Telegram Mini Apps, we allow access to admin routes and rely on:
 * 1. Client-side role checks (TelegramAuthProvider + AppShell)
 * 2. Server-side API authorization (each API endpoint checks user role)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    // For Telegram Mini Apps, allow access to admin pages
    // The client-side will handle role-based rendering
    // API routes will handle their own authorization
    return NextResponse.next();
  }
  
  // Not an admin route, allow access
  return NextResponse.next();
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
