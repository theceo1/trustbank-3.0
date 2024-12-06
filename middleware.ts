// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_AUTH_PATHS = ['/admin/auth/login', '/admin/auth/signup'];

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Always allow access to admin auth pages
    if (ADMIN_AUTH_PATHS.includes(req.nextUrl.pathname)) {
      return res;
    }

    // For non-auth admin pages, check admin status
    if (!session) {
      return NextResponse.redirect(new URL('/admin/auth/login', req.url));
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!adminUser) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return res;
};

export const config = {
  matcher: ['/admin/:path*']
};