// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // If no referral code, generate one
    if (!profile.referral_code) {
      const referralCode = `TB${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await supabase
        .from('user_profiles')
        .update({ referral_code: referralCode })
        .eq('user_id', user.id);
      profile.referral_code = referralCode;
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

    // Get user's auth data directly from auth.users
    const { data: authData, error: authDataError } = await supabase
      .from('auth.users')
      .select('email, phone, created_at, last_sign_in_at')
      .eq('id', user.id)
      .single();

    // Merge profile with auth data
    const fullProfile = {
      ...profile,
      email: profile.email || user.email,
      phone: profile.phone || user.phone,
      auth_created_at: user.created_at || profile.created_at,
      last_sign_in_at: user.last_sign_in_at,
      // Ensure boolean fields are properly set
      is_verified: profile.is_verified || profile.tier1_verified || false,
      tier1_verified: profile.tier1_verified || false,
      tier2_verified: profile.tier2_verified || false,
      tier3_verified: profile.tier3_verified || false,
      kyc_status: profile.kyc_status || 'pending',
      kyc_level: profile.kyc_level || 0
    };

    return NextResponse.json(fullProfile);
  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 