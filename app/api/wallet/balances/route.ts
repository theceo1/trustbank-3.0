import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';

// NGN is the base currency, followed by supported crypto currencies
const SUPPORTED_CURRENCIES = ['NGN', 'BTC', 'ETH', 'USDT', 'LTC'] as const;
const BASE_CURRENCY = 'NGN';

interface QuidaxWallet {
  currency: string;
  balance: string;
  locked: string;
}

interface WalletBalance {
  currency: string;
  balance: number;
  locked: number;
  total: number;
}

interface QuidaxResponse {
  status: string;
  data: QuidaxWallet[];
}

export async function GET() {
  try {
    console.log('[WalletBalances] Starting to fetch wallet balances');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const quidaxClient = new QuidaxClient();
    
    // Get current session
    console.log('[WalletBalances] Getting user session');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('[WalletBalances] No session found:', sessionError);
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    console.log('[WalletBalances] Session found for user:', session.user.email);

    // Get user's Quidax ID from user_profiles
    console.log('[WalletBalances] Fetching user profile');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('[WalletBalances] Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile.' },
        { status: 400 }
      );
    }

    if (!profile) {
      console.log('[WalletBalances] No profile found for user');
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    console.log('[WalletBalances] Profile found:', { 
      quidax_id: profile.quidax_id,
      is_verified: profile.is_verified,
      kyc_status: profile.kyc_status
    });

    if (!profile.is_verified || profile.kyc_status !== 'verified') {
      console.log('[WalletBalances] User not verified');
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          message: 'Complete KYC to view balance',
          redirectTo: '/profile/verification'
        },
        { status: 403 }
      );
    }

    // If no Quidax ID, try to create a sub-account
    if (!profile.quidax_id) {
      console.log('[WalletBalances] No Quidax ID found, creating sub-account');
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('email, first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (!userData) {
          throw new Error('User data not found');
        }

        console.log('[WalletBalances] Creating Quidax sub-account for:', userData.email);
        const quidaxUser = await quidaxClient.createSubAccount({
          email: userData.email,
          first_name: userData.first_name || 'User',
          last_name: userData.last_name || userData.email.split('@')[0]
        });

        console.log('[WalletBalances] Quidax sub-account created:', quidaxUser.data.id);

        // Update user profile with Quidax ID
        await supabase
          .from('user_profiles')
          .update({ quidax_id: quidaxUser.data.id })
          .eq('user_id', session.user.id);

        profile.quidax_id = quidaxUser.data.id;
      } catch (error: any) {
        console.error('[WalletBalances] Error creating Quidax account:', error);
        return NextResponse.json(
          { error: 'Failed to create Quidax account' },
          { status: 500 }
        );
      }
    }

    // Fetch wallet balances from Quidax
    console.log('[WalletBalances] Fetching wallet balances from Quidax');
    const walletData = await quidaxClient.fetchUserWallets(profile.quidax_id);
    
    // Transform and filter the data to match our interface and only include supported currencies
    const balances: WalletBalance[] = walletData.data
      .filter((wallet: QuidaxWallet) => 
        SUPPORTED_CURRENCIES.includes(wallet.currency.toUpperCase() as typeof SUPPORTED_CURRENCIES[number])
      )
      .map((wallet: QuidaxWallet) => ({
        currency: wallet.currency.toUpperCase(),
        balance: parseFloat(wallet.balance || '0'),
        locked: parseFloat(wallet.locked || '0'),
        total: parseFloat(wallet.balance || '0') + parseFloat(wallet.locked || '0')
      }))
      // Sort balances to show NGN first, then other currencies alphabetically
      .sort((a: WalletBalance, b: WalletBalance) => {
        if (a.currency === BASE_CURRENCY) return -1;
        if (b.currency === BASE_CURRENCY) return 1;
        return a.currency.localeCompare(b.currency);
      });

    console.log('[WalletBalances] Processed balances:', balances);

    return NextResponse.json({
      status: 'success',
      message: 'Wallets retrieved successfully',
      data: balances,
      base_currency: BASE_CURRENCY
    });
    
  } catch (error: any) {
    console.error('[WalletBalances] Error fetching wallet balances:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
} 