//app/api/trades/quote/route.ts
import { NextResponse } from 'next/server';
import { QuidaxSwapService } from '@/app/lib/services/quidax-swap';
import { handleApiError } from '@/app/lib/utils/errorHandling';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.error('No session found');
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    if (!profile?.is_verified) {
      return NextResponse.json({ error: 'Please complete your identity verification to trade' }, { status: 403 });
    }

    if (!profile?.quidax_id) {
      return NextResponse.json({ error: 'Your account is not properly set up for trading' }, { status: 400 });
    }

    const body = await request.json();
    const { from_currency, to_currency, from_amount } = body;

    if (!from_currency || !to_currency || !from_amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Creating swap quotation with:', {
      user_id: profile.quidax_id,
      from_currency,
      to_currency,
      from_amount: from_amount.toString()
    });

    try {
      const result = await QuidaxSwapService.createSwapQuotation({
        user_id: profile.quidax_id,
        from_currency,
        to_currency,
        from_amount: from_amount.toString()
      });

      console.log('Quotation result:', result);
      return NextResponse.json(result);
    } catch (swapError: any) {
      console.error('Swap quotation error:', swapError);
      return NextResponse.json(
        { error: swapError.message || 'Failed to create swap quotation' },
        { status: swapError.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Quote error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process quote request' },
      { status: error.status || 500 }
    );
  }
} 