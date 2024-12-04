import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user after authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user is admin
      const adminAccess = await prisma.admin_access_cache.findUnique({
        where: { user_id: user.id }
      });

      // Redirect based on admin status
      if (adminAccess?.is_admin) {
        return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin));
      }
    }
  }

  // Default redirect for non-admin users
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
} 