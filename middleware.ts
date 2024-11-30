// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Force dynamic behavior for specific routes
    const dynamicRoutes = [
      '/dashboard',
      '/profile',
      '/wallet',
      '/auth/verify',
      '/profile/wallet',
      '/admin'
    ];

    if (dynamicRoutes.some(route => pathname.startsWith(route))) {
      res.headers.set('x-middleware-cache', 'no-cache');
      res.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0');
      res.headers.set('Pragma', 'no-cache');
    }

    // Allow access to auth-related pages
    if (pathname.startsWith('/auth')) {
      if (session && pathname !== '/auth/verify') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return res;
    }

    // Redirect unauthenticated users to login
    if (!session && !pathname.startsWith('/auth')) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin for /admin routes
    if (pathname.startsWith('/admin')) {
      if (!session?.user?.id) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*, role:admin_roles(name, permissions)')
        .eq('user_id', session.user.id)
        .single();

      if (error || !adminUser || !adminUser.is_active) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/wallet/:path*'
  ],
};