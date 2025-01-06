import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

// NGN is the base currency, followed by supported crypto currencies
const SUPPORTED_CURRENCIES = ['NGN', 'USDT', 'BTC'] as const;
const BASE_CURRENCY = 'NGN';

interface WalletBalance {
  currency: string;
  balance: number;
  locked: number;
  total: number;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Unauthorized. Please sign in to continue.'
        },
        { status: 401 }
      );
    }

    // Get user's Quidax ID from profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile?.quidax_id) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'User profile not found'
        },
        { status: 404 }
      );
    }

    // If KYC is not verified, return error
    if (profile.kyc_status !== 'verified') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'KYC verification required',
          redirectTo: '/profile/verification'
        },
        { status: 403 }
      );
    }

    // Fetch wallet balances from Quidax
    const wallets = await quidaxClient.fetchUserWallets(profile.quidax_id);

    // Transform and format wallet data
    const formattedWallets = wallets
      .filter(wallet => SUPPORTED_CURRENCIES.includes(wallet.currency.toUpperCase() as typeof SUPPORTED_CURRENCIES[number]))
      .map(wallet => ({
        currency: wallet.currency.toUpperCase(),
        balance: parseFloat(wallet.balance),
        locked: parseFloat(wallet.locked),
        total: parseFloat(wallet.balance) + parseFloat(wallet.locked)
      }))
      .sort((a, b) => {
        if (a.currency === BASE_CURRENCY) return -1;
        if (b.currency === BASE_CURRENCY) return 1;
        return b.total - a.total;
      });

    return NextResponse.json({
      status: 'success',
      message: 'Balances retrieved successfully',
      data: formattedWallets,
      base_currency: BASE_CURRENCY
    });
    
  } catch (error: any) {
    console.error('[WalletBalances] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to fetch wallet balances'
      },
      { status: error.status || 500 }
    );
  }
} 