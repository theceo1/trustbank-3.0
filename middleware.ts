// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/callback',
  '/api/webhooks',
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/about',
  '/calculator',
  '/market'
];

const ADMIN_PATHS = ['/admin'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss://ws.quidax.com wss://www.quidax.com ws://ws.quidax.com ws://www.quidax.com https://www.quidax.com; frame-src 'self'"
  );

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path));
  if (isPublicPath) {
    return response;
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();

    // If no session and not on a public path, redirect to login
    if (!session) {
      // Check if this is a redirect from signup
      const isSignupRedirect = request.nextUrl.pathname === '/dashboard' && 
        request.headers.get('referer')?.includes('/auth/signup');
      
      if (isSignupRedirect) {
        // For signup redirects, try to get the session one more time
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (retrySession) {
          return response;
        }
        // If still no session, wait a bit and try one final time
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session: finalTry } } = await supabase.auth.getSession();
        if (finalTry) {
          return response;
        }
      }

      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if trying to access admin routes
    const isAdminPath = ADMIN_PATHS.some(path => request.nextUrl.pathname.startsWith(path));
    if (isAdminPath && !session.user.app_metadata?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Update session if needed
    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
    if (refreshedSession?.access_token !== session.access_token && refreshedSession?.refresh_token) {
      // Session was refreshed, update the response
      const { data: { session: newSession } } = await supabase.auth.setSession({
        access_token: refreshedSession.access_token,
        refresh_token: refreshedSession.refresh_token
      });
      if (newSession) {
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Only redirect on auth-related errors
    if (error instanceof Error && 
        (error.message.includes('auth') || error.message.includes('token') || error.message.includes('session'))) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }
}