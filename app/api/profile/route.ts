// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with all details
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        full_name,
        email,
        phone,
        country,
        referral_code,
        kyc_level,
        kyc_status,
        is_verified,
        created_at,
        daily_limit,
        monthly_limit,
        quidax_id,
        tier1_verified,
        tier2_verified,
        tier3_verified,
        verification_limits
      `)
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 