//app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user after authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user is admin
      const { data: adminAccess } = await supabase
        .from('admin_access_cache')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      // Only redirect to admin routes if user is admin
      if (adminAccess?.is_admin && redirectTo.includes('/admin')) {
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
      }
    }
  }

  // Default redirect for non-admin users
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
} 