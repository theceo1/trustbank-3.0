import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';
import { KYCTier } from '@/app/types/kyc';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Get cookie store and authenticate user
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Please sign in to view your wallet information.' 
      }, { status: 401 });
    }

    // Verify user has permission to access this wallet
    if (session.user.id !== params.userId) {
      return NextResponse.json({ 
        error: 'You do not have permission to view this wallet.' 
      }, { status: 403 });
    }

    // Get user profile to check KYC status
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        quidax_id,
        kyc_level,
        kyc_status,
        is_verified
      `)
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ 
        error: 'Unable to fetch user profile. Please try again later.' 
      }, { status: 500 });
    }

    // Check if user has at least basic KYC verification
    if (!userProfile.is_verified || userProfile.kyc_level < KYCTier.BASIC || userProfile.kyc_status !== 'verified') {
      return NextResponse.json({
        error: 'Please complete KYC verification to access your wallet.',
        kyc_required: true,
        current_level: userProfile.kyc_level || KYCTier.NONE
      }, { status: 403 });
    }

    // Initialize wallet service and get wallet details
    const walletService = new QuidaxWalletService();
    const walletDetails = await walletService.getWallet(session.user.id, 'usdt');

    return NextResponse.json(walletDetails);

  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch wallet details.' 
    }, { status: 500 });
  }
} 