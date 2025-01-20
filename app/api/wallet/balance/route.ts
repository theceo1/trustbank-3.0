// /app/api/wallet/balance/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getWalletService } from '@/app/lib/services/quidax-wallet';
import { ProfileService } from '@/app/lib/services/profile';

interface WalletData {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  blockchain_enabled: boolean;
  default_network: string | null;
  address?: string;
  networks?: {
    id: string;
    name: string;
    deposits_enabled: boolean;
    withdraws_enabled: boolean;
  }[];
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Session error' }, { status: 401 });
    }
    
    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    console.log('Session found for user:', session.user.id);

    // Get or create user profile
    let profile;
    try {
      profile = await ProfileService.getProfile(session.user.id);
      console.log('Found profile:', profile);
    } catch (error) {
      console.log('Profile not found, creating new profile');
      // If profile doesn't exist, create it
      profile = await ProfileService.createProfile(session.user.id, session.user.email!);
      console.log('Created new profile:', profile);
    }

    if (!profile?.quidax_id) {
      console.error('No Quidax ID found for profile');
      return NextResponse.json({ error: 'Profile not found or missing Quidax ID' }, { status: 404 });
    }

    // Use QuidaxWalletService to fetch wallet data
    const walletService = getWalletService();
    console.log('Fetching wallets for Quidax ID:', profile.quidax_id);
    const walletResponse = await walletService.getWallets(profile.quidax_id);
    console.log('Wallet response:', walletResponse);

    return NextResponse.json({
      status: 'success',
      success: true,
      message: 'Wallet data retrieved successfully',
      data: walletResponse.data
    });
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
} 