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
  '/manifest.json'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (PUBLIC_PATHS.some(path => req.nextUrl.pathname.startsWith(path))) {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req, res });
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'No active session' }, 
          { status: 401 }
        );
      }

      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)',
  ],
};