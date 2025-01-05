import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KYCTier } from '@/app/types/kyc';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  kyc_status: string;
  kyc_level: number;
  is_verified: boolean;
  daily_limit: number;
  monthly_limit: number;
  verification_status: {
    tier1_verified: boolean;
    tier2_verified: boolean;
    tier3_verified: boolean;
  };
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: sessionError.message 
      }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log('Fetching profile for user:', session.user.id);

    // Get user's KYC status from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, email, kyc_status, kyc_level, is_verified, daily_limit, monthly_limit, verification_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);

      // If no profile exists, create one
      if (profileError.code === 'PGRST116') {
        console.log('Creating new profile for user:', session.user.id);

        const defaultProfile = {
          user_id: session.user.id,
          email: session.user.email,
          kyc_status: 'pending',
          kyc_level: 0,
          is_verified: false,
          daily_limit: 50000,
          monthly_limit: 1000000,
          verification_status: {
            tier1_verified: false,
            tier2_verified: false,
            tier3_verified: false
          }
        };

        try {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([defaultProfile])
            .select('id, user_id, email, kyc_status, kyc_level, is_verified, daily_limit, monthly_limit, verification_status')
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            return NextResponse.json({ 
              error: 'Failed to create user profile',
              details: createError.message 
            }, { status: 500 });
          }

          console.log('Created new profile:', newProfile);

          return NextResponse.json({
            verified: false,
            kyc_level: 0,
            daily_limit: defaultProfile.daily_limit,
            monthly_limit: defaultProfile.monthly_limit,
            verification_status: defaultProfile.verification_status
          });
        } catch (createError: any) {
          console.error('Profile creation error:', createError);
          return NextResponse.json({ 
            error: 'Failed to create user profile',
            details: createError.message 
          }, { status: 500 });
        }
      }

      return NextResponse.json({ 
        error: 'Failed to fetch KYC status',
        details: profileError.message 
      }, { status: 500 });
    }

    // Get verification status from the JSONB field
    const verificationStatus = profile.verification_status || {
      tier1_verified: false,
      tier2_verified: false,
      tier3_verified: false
    };

    // Consider user verified if they have kyc_status === 'verified' and at least tier1 verification
    const isVerified = profile.kyc_status === 'verified' && verificationStatus.tier1_verified;

    return NextResponse.json({
      verified: isVerified,
      kyc_level: profile.kyc_level || 0,
      daily_limit: profile.daily_limit || 50000,
      monthly_limit: profile.monthly_limit || 1000000,
      verification_status: verificationStatus
    });
    
  } catch (error: any) {
    console.error('KYC status check error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 