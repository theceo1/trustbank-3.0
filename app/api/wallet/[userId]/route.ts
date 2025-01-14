// /app/api/wallet/[userId]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getWalletService } from '@/app/lib/services/quidax-wallet';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is requesting their own wallet
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Unauthorized to access this wallet' }, { status: 403 });
    }

    // Get the user's profile to check if they have access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_verified, quidax_id, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (!profile?.is_verified) {
      return NextResponse.json({
        error: 'KYC verification required',
        message: 'Please complete your identity verification to access your wallet.',
        redirectTo: '/profile/verification'
      }, { status: 403 });
    }

    if (!profile?.quidax_id) {
      return NextResponse.json({ error: 'Quidax account not linked' }, { status: 400 });
    }

    // Get the user's wallets from Quidax
    const walletService = getWalletService();
    try {
      const walletResponse = await walletService.getAllWallets(profile.quidax_id);
      return NextResponse.json({
        status: 'success',
        data: walletResponse.data
      });
    } catch (error: any) {
      console.error('Error fetching wallets from Quidax:', error);
      if (error.message === 'Request timeout') {
        return NextResponse.json({ 
          error: 'The request to fetch wallet data timed out. Please try again.' 
        }, { status: 504 });
      }
      return NextResponse.json({ 
        error: error.message || 'Failed to fetch wallet details' 
      }, { status: error.status || 500 });
    }
  } catch (error: any) {
    console.error('Wallet route error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 