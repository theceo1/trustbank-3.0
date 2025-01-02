import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { getQuidaxClient } from '@/app/lib/services/quidax-client';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Get user's Quidax ID from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, kyc_verified')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { message: 'Failed to fetch user profile.' },
        { status: 400 }
      );
    }

    if (!profile.kyc_verified) {
      return NextResponse.json(
        { 
          message: 'Complete KYC to view balance',
          redirect: '/kyc-verification'
        },
        { status: 403 }
      );
    }

    if (!profile.quidax_id) {
      return NextResponse.json(
        { message: 'Quidax account not linked.' },
        { status: 400 }
      );
    }

    // Fetch wallet balances from Quidax
    const quidaxClient = getQuidaxClient();
    const response = await quidaxClient.get(`/users/${profile.quidax_id}/wallets`);

    return NextResponse.json({
      status: 'success',
      message: 'Wallet balances retrieved successfully',
      data: response
    });

  } catch (error: any) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
} 