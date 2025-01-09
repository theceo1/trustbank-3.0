// app/api/admin/referrals/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all referrals with user details
    const { data: referrals, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        referral_code,
        referred_by,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
} 