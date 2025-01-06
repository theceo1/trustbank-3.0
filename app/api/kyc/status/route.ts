import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KYCTier } from '@/app/types/kyc';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log('Fetching profile for user:', session.user.id);

    // Get user's KYC status from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        email,
        kyc_status,
        kyc_level,
        is_verified,
        daily_limit,
        monthly_limit,
        tier1_verified,
        tier2_verified,
        tier3_verified,
        tier1_submitted_at,
        tier2_submitted_at,
        tier3_submitted_at,
        tier1_verified_at,
        tier2_verified_at,
        tier3_verified_at,
        verification_limits
      `)
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      // If no profile exists, create one
      if (profileError.code === 'PGRST116') {
        const defaultProfile = {
          user_id: session.user.id,
          email: session.user.email,
          kyc_status: 'pending',
          kyc_level: 0,
          is_verified: false,
          daily_limit: 50000,
          monthly_limit: 1000000,
          tier1_verified: false,
          tier2_verified: false,
          tier3_verified: false,
          verification_limits: {
            tier1: { daily: 50000, monthly: 1000000 },
            tier2: { daily: 200000, monthly: 5000000 },
            tier3: { daily: 1000000, monthly: 20000000 }
          }
        };

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          return NextResponse.json({ 
            error: 'Failed to create user profile'
          }, { status: 500 });
        }

        return NextResponse.json({
          verified: false,
          kyc_level: 0,
          kyc_status: 'pending',
          daily_limit: defaultProfile.daily_limit,
          monthly_limit: defaultProfile.monthly_limit,
          verification_status: {
            tier1: {
              verified: false,
              submitted: false,
              required: true
            },
            tier2: {
              verified: false,
              submitted: false,
              available: false
            },
            tier3: {
              verified: false,
              submitted: false,
              available: false
            }
          }
        });
      }

      return NextResponse.json({ 
        error: 'Failed to fetch KYC status'
      }, { status: 500 });
    }

    // Determine verification status
    const verificationStatus = {
      tier1: {
        verified: profile.tier1_verified || false,
        submitted: !!profile.tier1_submitted_at,
        verifiedAt: profile.tier1_verified_at,
        required: true
      },
      tier2: {
        verified: profile.tier2_verified || false,
        submitted: !!profile.tier2_submitted_at,
        verifiedAt: profile.tier2_verified_at,
        available: profile.tier1_verified || false
      },
      tier3: {
        verified: profile.tier3_verified || false,
        submitted: !!profile.tier3_submitted_at,
        verifiedAt: profile.tier3_verified_at,
        available: profile.tier2_verified || false
      }
    };

    // A user is considered verified if they have completed at least Tier 1
    const isVerified = profile.tier1_verified || false;

    return NextResponse.json({
      verified: isVerified,
      kyc_level: profile.kyc_level || 0,
      kyc_status: profile.kyc_status || 'pending',
      daily_limit: profile.daily_limit || 50000,
      monthly_limit: profile.monthly_limit || 1000000,
      verification_status: verificationStatus
    });
    
  } catch (error: any) {
    console.error('KYC status check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 });
  }
} 