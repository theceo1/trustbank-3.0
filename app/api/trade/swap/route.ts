import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { quotation_id } = body;

    if (!quotation_id) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      );
    }

    // Get user's Quidax ID from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile.' },
        { status: 400 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    if (!profile.is_verified || profile.kyc_status !== 'verified') {
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          message: 'Complete KYC to perform trades',
          redirectTo: '/profile/verification'
        },
        { status: 403 }
      );
    }

    // Confirm swap quotation
    const response = await quidaxClient.confirmSwapQuotation({
      user_id: profile.quidax_id,
      quotation_id
    });

    return NextResponse.json({
      status: 'success',
      message: 'Swap completed successfully',
      data: response
    });

  } catch (error: any) {
    console.error('[TradeSwap] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete swap' },
      { status: 500 }
    );
  }
} 