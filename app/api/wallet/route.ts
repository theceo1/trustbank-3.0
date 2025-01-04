import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';

export async function GET() {
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

    // Get user profile to check KYC status
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        quidax_id,
        kyc_level,
        is_verified,
        kyc_status,
        tier1_verified,
        tier2_verified,
        tier3_verified
      `)
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ 
        error: 'Unable to fetch user profile. Please try again later.' 
      }, { status: 500 });
    }

    if (!userProfile) {
      return NextResponse.json({ 
        error: 'User profile not found. Please complete your registration.' 
      }, { status: 404 });
    }

    if (!userProfile.quidax_id) {
      return NextResponse.json({ 
        error: 'Wallet not set up. Please complete your registration.',
        setup_required: true
      }, { status: 400 });
    }

    // Check KYC verification status
    if (!userProfile.tier1_verified) {
      return NextResponse.json({ 
        error: 'Please complete your identity verification to access your wallet.',
        kyc_required: true,
        kyc_status: userProfile.kyc_status,
        kyc_level: userProfile.kyc_level,
        verification_status: {
          tier1: {
            verified: userProfile.tier1_verified,
            required: true
          },
          tier2: {
            verified: userProfile.tier2_verified,
            available: userProfile.tier1_verified
          },
          tier3: {
            verified: userProfile.tier3_verified,
            available: userProfile.tier2_verified
          }
        }
      }, { status: 403 });
    }

    const walletService = new QuidaxWalletService();
    
    // Get wallet data
    const walletData = await walletService.getAllWallets(userProfile.quidax_id);
    if (walletData.error) {
      console.error('Error fetching wallets:', walletData.error);
      return NextResponse.json({ 
        error: walletData.error
      }, { status: 500 });
    }

    // Get transaction history
    const transactionData = await walletService.getTransactionHistory(userProfile.quidax_id);
    if (transactionData.error) {
      console.error('Error fetching transactions:', transactionData.error);
      return NextResponse.json({ 
        error: transactionData.error
      }, { status: 500 });
    }

    return NextResponse.json({
      wallets: walletData.data?.wallets || [],
      transactions: transactionData.data?.transactions || []
    });
  } catch (error) {
    console.error('[API] Error fetching wallet data:', error);
    
    // Return mock data in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        wallets: [{
          currency: 'USDT',
          balance: '1000.00',
          available_balance: '1000.00',
          pending_balance: '0.00'
        }],
        transactions: [{
          id: '1',
          type: 'credit',
          amount: '1000.00',
          currency: 'USDT',
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z'
        }]
      });
    }

    return NextResponse.json(
      { error: 'Unable to fetch wallet information. Please try again later.' },
      { status: 500 }
    );
  }
} 