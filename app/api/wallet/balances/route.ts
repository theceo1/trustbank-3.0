import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

// NGN is the base currency, followed by supported crypto currencies
const SUPPORTED_CURRENCIES = ['NGN', 'USDT', 'BTC'] as const;
const BASE_CURRENCY = 'NGN';
const TIMEOUT_DURATION = 15000; // Increased to 15 seconds

interface Wallet {
  id: string;
  currency: string;
  balance: string;
  pending_balance: string;
  total_balance: string;
  total_deposits: string;
  total_withdrawals: string;
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

    // Get user's Quidax ID from profile with timeout
    const profilePromise = supabase
      .from('user_profiles')
      .select('quidax_id, kyc_status, email')
      .eq('user_id', session.user.id)
      .single();

    const profileTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout')), TIMEOUT_DURATION);
    });

    const { data: profile, error: profileError } = await Promise.race([
      profilePromise,
      profileTimeout
    ]) as any;

    if (profileError) {
      console.error('[WalletBalances] Profile error:', profileError);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Failed to fetch user profile.'
        },
        { status: 500 }
      );
    }

    // If no profile or no Quidax ID, return empty balances
    if (!profile?.quidax_id) {
      return NextResponse.json({
        status: 'success',
        message: 'No wallet setup yet',
        data: SUPPORTED_CURRENCIES.map(currency => ({
          currency,
          balance: 0,
          pending_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0
        })),
        base_currency: BASE_CURRENCY
      });
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

    // Fetch wallet balances from Quidax with timeout and retry logic
    let retries = 2;
    let lastError: any = null;

    while (retries >= 0) {
      try {
        const walletsPromise = quidaxClient.fetchUserWallets(profile.quidax_id);
        const walletsTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Wallet fetch timeout')), TIMEOUT_DURATION);
        });

        const wallets = await Promise.race([walletsPromise, walletsTimeout]) as any;
        
        if (!wallets?.data) {
          throw new Error('No wallet data received');
        }

        // Process and sort wallets
        const processedWallets = wallets.data
          .filter((wallet: Wallet) => 
            SUPPORTED_CURRENCIES.includes(wallet.currency.toUpperCase() as typeof SUPPORTED_CURRENCIES[number])
          )
          .map((wallet: Wallet) => ({
            currency: wallet.currency.toUpperCase(),
            balance: wallet.balance || '0',
            locked: wallet.pending_balance || '0',
            staked: '0',
            converted_balance: wallet.balance || '0',
            reference_currency: BASE_CURRENCY,
            is_crypto: wallet.currency.toUpperCase() !== 'NGN',
            blockchain_enabled: wallet.currency.toUpperCase() !== 'NGN',
            default_network: null,
            networks: []
          }));

        // Add missing currencies with zero balance
        SUPPORTED_CURRENCIES.forEach(currency => {
          if (!processedWallets.find((w: { currency: string }) => w.currency === currency)) {
            processedWallets.push({
              currency,
              balance: '0',
              locked: '0',
              staked: '0',
              converted_balance: '0',
              reference_currency: BASE_CURRENCY,
              is_crypto: currency !== 'NGN',
              blockchain_enabled: currency !== 'NGN',
              default_network: null,
              networks: []
            });
          }
        });

        // Sort wallets by balance
        processedWallets.sort((a: { balance: string }, b: { balance: string }) => 
          parseFloat(b.balance) - parseFloat(a.balance)
        );

        return NextResponse.json({
          status: 'success',
          message: 'Balances retrieved successfully',
          data: processedWallets,
          base_currency: BASE_CURRENCY
        });

      } catch (error: any) {
        console.error(`[WalletBalances] Attempt ${2 - retries} failed:`, error);
        lastError = error;
        retries--;
        if (retries >= 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    // If all retries failed, return empty balances with 200 status
    console.error('[WalletBalances] All attempts failed:', lastError);
    return NextResponse.json(
      { 
        status: 'success',
        message: 'Temporarily unable to fetch live balances',
        data: SUPPORTED_CURRENCIES.map(currency => ({
          currency,
          balance: 0,
          pending_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0
        })),
        base_currency: BASE_CURRENCY
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('[WalletBalances] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to fetch wallet balances',
        data: SUPPORTED_CURRENCIES.map(currency => ({
          currency,
          balance: 0,
          pending_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0
        })),
        base_currency: BASE_CURRENCY
      },
      { status: 200 } // Return 200 with empty balances instead of 500
    );
  }
} 