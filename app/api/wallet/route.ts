import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getWalletService } from '@/app/lib/services/quidax-wallet';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check KYC status
    if (!profile.is_verified || profile.kyc_status !== 'verified') {
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          redirectTo: '/profile/verification'
        }, 
        { status: 403 }
      );
    }

    // Check if Quidax account is linked
    if (!profile.quidax_id) {
      return NextResponse.json(
        { 
          error: 'Wallet setup required',
          setup_required: true
        }, 
        { status: 400 }
      );
    }

    // Get wallet data
    const walletService = getWalletService();
    const walletResponse = await walletService.getAllWallets(profile.quidax_id);

    return NextResponse.json({
      status: 'success',
      data: walletResponse.data
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
} 