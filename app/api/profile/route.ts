// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        tier1_verified,
        tier2_verified,
        tier3_verified,
        tier1_submitted_at,
        tier2_submitted_at,
        tier3_submitted_at,
        verification_limits,
        kyc_status,
        kyc_level,
        is_verified,
        quidax_id
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

    // If verification_limits is not set, use default limits
    if (!profile.verification_limits) {
      profile.verification_limits = {
        tier1: {
          daily: 50000,    // ₦50,000
          monthly: 500000  // ₦500,000
        },
        tier2: {
          daily: 200000,   // ₦200,000
          monthly: 2000000 // ₦2,000,000
        },
        tier3: {
          daily: 1000000,  // ₦1,000,000
          monthly: 10000000 // ₦10,000,000
        }
      };

      // Update the profile with default limits
      await supabase
        .from('user_profiles')
        .update({ verification_limits: profile.verification_limits })
        .eq('user_id', user.id);
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