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
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  // Check if path is public
  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return response;
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Handle session refresh errors
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Only redirect to login if it's a fatal session error
      if (sessionError.message.includes('invalid token') || sessionError.message.includes('expired')) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      // For other errors, allow the request to continue
      return response;
    }

    // Check if trying to access admin routes
    if (ADMIN_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      if (!session) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is admin
      if (!session.user.app_metadata?.is_admin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return response;
    }

    // For non-admin protected routes
    if (!session) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Session exists and is valid
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Only redirect on fatal errors
    if (error instanceof Error && (error.message.includes('invalid token') || error.message.includes('expired'))) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }
}