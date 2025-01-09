import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxWalletService, getWalletService } from '@/app/lib/services/quidax-wallet';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('quidax_id')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile?.quidax_id) {
      return Response.json(
        { error: 'User profile or Quidax ID not found' },
        { status: 404 }
      );
    }

    // Get the wallet service instance
    const walletService = getWalletService();

    // Now fetch the wallet using their Quidax ID
    const walletResponse = await walletService.getWallet(
      userProfile.quidax_id,
      'ngn' // or whatever default currency you want to use
    );

    return Response.json(walletResponse);
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
} 