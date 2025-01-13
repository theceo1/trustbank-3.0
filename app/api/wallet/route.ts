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
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ 
        error: 'Failed to fetch user profile' 
      }, { status: 500 });
    }

    if (!userProfile?.quidax_id) {
      return NextResponse.json({ 
        error: 'User profile not properly setup',
        setup_required: true
      }, { status: 400 });
    }

    if (!userProfile.is_verified) {
      return NextResponse.json({
        error: 'KYC verification required',
        message: 'Please complete your identity verification to access your wallet.',
        redirectTo: '/profile/verification'
      }, { status: 403 });
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