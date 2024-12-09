// app/api/trades/quote/route.ts
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import debug from 'debug';

const log = debug('api:trades:quote');

export async function POST(request: Request) {
  try {
    log('Processing trade quote request');
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: async () => cookieStore 
    });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      log('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    if (!session) {
      log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    log('Checking KYC status for user:', session.user.id);
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('kyc_verified')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      log('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Failed to verify KYC status' }, { status: 500 });
    }

    if (!profile?.kyc_verified) {
      log('User not KYC verified');
      return NextResponse.json(
        { error: 'KYC verification required to trade' },
        { status: 403 }
      );
    }

    const body = await request.json();
    log('Getting quote for params:', body);

    const quote = await QuidaxService.getRate({
      amount: body.amount.toString(),
      currency_pair: `${body.fromCurrency}_${body.toCurrency}`.toLowerCase(),
      type: body.type
    });

    log('Quote received:', quote);
    return NextResponse.json(quote);
  } catch (error: any) {
    log('Quote error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get quote',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}