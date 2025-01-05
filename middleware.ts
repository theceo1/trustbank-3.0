// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if path is public
  if (PUBLIC_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
    return res;
  }

  try {
    // Refresh session if it exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Handle session refresh errors
    if (sessionError) {
      console.error('Session error:', sessionError);
      const response = NextResponse.redirect(new URL('/auth/login', req.url));
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }

    // Check if trying to access admin routes
    if (ADMIN_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
      if (!session) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirect', req.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is admin
      if (!session.user.app_metadata?.is_admin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return res;
    }

    // For non-admin protected routes
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Session exists and is valid
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.redirect(new URL('/auth/login', req.url));
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)',
  ],
};