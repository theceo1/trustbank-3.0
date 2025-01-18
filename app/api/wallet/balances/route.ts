import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService, WalletBalance } from '@/lib/services/quidax';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    if (!profile?.quidax_id) {
      return NextResponse.json(
        { error: 'Quidax account not linked' },
        { status: 400 }
      );
    }

    // Get wallet balances from Quidax
    const wallets = await QuidaxService.fetchWalletBalances(profile.quidax_id);
    
    // Get wallet addresses for each currency
    const walletsWithAddresses = await Promise.all(
      wallets.map(async (wallet: WalletBalance) => {
        if (wallet.blockchain_enabled) {
          try {
            const { address } = await QuidaxService.fetchWalletAddress(profile.quidax_id, wallet.currency);
            return { ...wallet, address };
          } catch (error) {
            console.error(`Error fetching address for ${wallet.currency}:`, error);
            return wallet;
          }
        }
        return wallet;
      })
    );

    return NextResponse.json({
      status: 'success',
      data: walletsWithAddresses
    });

  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
} 