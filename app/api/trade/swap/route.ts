import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const quidaxClient = new QuidaxClient();
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Get trade details from request body
    const { from_currency, to_currency, from_amount } = await request.json();

    if (!from_currency || !to_currency || !from_amount) {
      return NextResponse.json(
        { error: 'Missing required trade parameters' },
        { status: 400 }
      );
    }

    // Get user's Quidax ID from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified, kyc_status')
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile.' },
        { status: 400 }
      );
    }

    if (!profile.is_verified || profile.kyc_status !== 'verified') {
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          message: 'Complete KYC to trade',
          redirectTo: '/profile/verification'
        },
        { status: 403 }
      );
    }

    if (!profile.quidax_id) {
      return NextResponse.json(
        { error: 'Quidax account not linked' },
        { status: 400 }
      );
    }

    // Create swap quotation
    const quotation = await quidaxClient.createSwapQuotation(profile.quidax_id, {
      from_currency: from_currency.toUpperCase(),
      to_currency: to_currency.toUpperCase(),
      from_amount: from_amount.toString()
    });

    // Confirm the swap quotation
    const swap = await quidaxClient.confirmSwapQuotation(
      profile.quidax_id,
      quotation.data.id
    );

    return NextResponse.json({
      status: 'success',
      message: 'Swap initiated successfully',
      data: swap.data
    });

  } catch (error: any) {
    console.error('Error processing swap:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process swap' },
      { status: 500 }
    );
  }
} 