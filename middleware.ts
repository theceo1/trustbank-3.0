// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AdminService } from '@/app/lib/services/admin';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Dynamic routes configuration (referencing existing code)
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

    // Handle admin routes first
    if (pathname.startsWith('/admin')) {
      if (!session?.user?.id) {
        return NextResponse.redirect(new URL('/admin/auth/login', req.url));
      }

      const { data: adminAccess } = await supabase
        .from('admin_access_cache')
        .select('is_admin, permissions')
        .eq('user_id', session.user.id)
        .single();

      if (!adminAccess?.is_admin) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return res;
    }

    // Handle auth routes
    if (pathname.startsWith('/auth')) {
      if (session) {
        // Check if user is admin and redirect accordingly
        const { data: adminAccess } = await supabase
          .from('admin_access_cache')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        if (adminAccess?.is_admin) {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return res;
    }

    // Handle protected routes
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Determine appropriate redirect based on the route type
    const redirectUrl = pathname.startsWith('/admin') 
      ? '/admin/auth/login' 
      : '/auth/login';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
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