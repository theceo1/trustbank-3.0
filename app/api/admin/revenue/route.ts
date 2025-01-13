import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify admin access
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch revenue data
    const { data: revenueData, error: revenueError } = await supabase
      .from('platform_revenue')
      .select('*')
      .order('created_at', { ascending: false });

    if (revenueError) {
      console.error('Error fetching revenue data:', revenueError);
      return new NextResponse('Failed to fetch revenue data', { status: 500 });
    }

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error in revenue API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 