import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First get the user's profile to get their Quidax ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (!userProfile?.quidax_id) {
      return NextResponse.json({ 
        error: 'User profile not properly setup' 
      }, { status: 400 });
    }

    // Now fetch the wallet using their Quidax ID
    const walletResponse = await QuidaxWalletService.getWallet(
      userProfile.quidax_id,
      'ngn' // or whatever default currency you want to use
    );

    if (!walletResponse.data) {
      return NextResponse.json({ 
        error: 'Failed to fetch wallet data' 
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "success",
      data: {
        currency: 'ngn',
        balance: walletResponse.data.balance || "0.00",
        pending: walletResponse.data.locked || "0.00",
        total: walletResponse.data.total || "0.00"
      }
    });

  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet details' }, 
      { status: 500 }
    );
  }
} 