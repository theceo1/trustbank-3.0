import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MarketRateService } from '@/app/lib/services/market-rate';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rate = await MarketRateService.getRate({
      amount: body.amount,
      currency_pair: `${body.currency.toLowerCase()}_ngn`,
      type: body.type
    });

    return NextResponse.json(rate);
  } catch (error: any) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rate' },
      { status: 500 }
    );
  }
}