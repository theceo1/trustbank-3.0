import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxWalletService, getWalletService } from '@/app/lib/services/quidax-wallet';

export const dynamic = 'force-dynamic';

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
      .from('profiles')
      .select('quidax_id')
      .eq('id', session.user.id)
      .single();

    if (!userProfile?.quidax_id) {
      return NextResponse.json({ 
        error: 'User profile not properly setup' 
      }, { status: 400 });
    }

    const walletService = getWalletService();
    
    // Get wallet data
    const walletData = await walletService.getAllWallets(userProfile.quidax_id);

    if (!walletData.data) {
      return NextResponse.json({ 
        error: 'Failed to fetch wallet data' 
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "success",
      data: walletData.data
    });

  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet details' }, 
      { status: 500 }
    );
  }
} 