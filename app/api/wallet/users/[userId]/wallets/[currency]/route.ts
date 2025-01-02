//app/api/wallet/users/[userId]/wallets/[currency]/route.
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';

export async function GET(request: Request, { params }: { params: { userId: string; currency: string } }) {
  try {
    // Get cookie store and await it
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    // Get session for authentication and await it
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get user profile and await it
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        quidax_id, 
        kyc_level,
        is_verified,
        kyc_status,
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
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', {
        error: profileError,
        userId: session.user.id
      });
      return NextResponse.json({ 
        error: 'Failed to fetch user profile' 
      }, { status: 500 });
    }

    if (!userProfile?.quidax_id) {
      console.error('Missing Quidax ID:', {
        userId: session.user.id,
        profile: userProfile
      });
      return NextResponse.json({ 
        error: 'User profile not properly set up' 
      }, { status: 400 });
    }

    // Determine verification status and requirements
    const verificationStatus = {
      tier1: {
        name: 'NIN & Selfie Verification',
        description: 'Basic verification using NIN and selfie photo',
        verified: userProfile.tier1_verified || false,
        submitted: !!userProfile.tier1_submitted_at,
        verifiedAt: userProfile.tier1_verified_at,
        required: true,
        limits: userProfile.verification_limits?.tier1 || { daily: 1000, monthly: 20000 }
      },
      tier2: {
        name: 'BVN Verification',
        description: 'Intermediate verification using BVN',
        verified: userProfile.tier2_verified || false,
        submitted: !!userProfile.tier2_submitted_at,
        verifiedAt: userProfile.tier2_verified_at,
        available: userProfile.tier1_verified, // Only available after Tier 1
        required: false,
        limits: userProfile.verification_limits?.tier2 || { daily: 5000, monthly: 100000 }
      },
      tier3: {
        name: 'Government ID Verification',
        description: 'Advanced verification using government-issued ID',
        verified: userProfile.tier3_verified || false,
        submitted: !!userProfile.tier3_submitted_at,
        verifiedAt: userProfile.tier3_verified_at,
        available: userProfile.tier2_verified, // Only available after Tier 2
        required: false,
        limits: userProfile.verification_limits?.tier3 || { daily: 10000, monthly: 500000 }
      }
    };

    // Check KYC verification status
    if (!userProfile.tier1_verified) {
      return NextResponse.json({ 
        error: 'KYC verification required',
        kyc_status: userProfile.kyc_status,
        kyc_level: userProfile.kyc_level,
        verification_needed: true,
        verification_status: verificationStatus,
        message: 'Please complete Tier 1 (NIN & Selfie) verification to access basic features'
      }, { status: 403 });
    }

    // Log the request details for debugging
    console.log('Fetching wallet with:', {
      quidaxId: userProfile.quidax_id,
      currency: params.currency,
      kyc_status: userProfile.kyc_status,
      kyc_level: userProfile.kyc_level,
      verification_status: verificationStatus
    });

    // Fetch wallet data from Quidax using the correct endpoint structure
    try {
      const walletData = await QuidaxWalletService.getWallet(
        userProfile.quidax_id,
        params.currency.toLowerCase()
      );

      if (!walletData?.data) {
        console.error('Invalid wallet data:', {
          response: walletData,
          quidaxId: userProfile.quidax_id,
          currency: params.currency
        });
        return NextResponse.json({ 
          error: 'Failed to fetch wallet data' 
        }, { status: 500 });
      }

      return NextResponse.json({
        status: 'success',
        data: walletData.data,
        verification_status: verificationStatus
      });

    } catch (error: any) {
      console.error('Error fetching wallet from Quidax:', {
        error: error.message,
        stack: error.stack,
        quidaxId: userProfile.quidax_id,
        currency: params.currency
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch wallet',
          details: error.message
        }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' }, 
      { status: 500 }
    );
  }
} 