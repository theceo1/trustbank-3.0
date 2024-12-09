//app/api/trade/quotation/route.ts

import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';

const QUIDAX_API_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL;

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // First get market rate using public endpoint
    const marketPair = `${body.fromCurrency}${body.toCurrency}`.toLowerCase();
    const marketRate = await QuidaxService.getMarketStats(marketPair);

    // Get temporary quotation with current market rate
    const tempQuote = await QuidaxService.getTemporaryQuotation({
      from_currency: body.fromCurrency.toLowerCase(),
      to_currency: body.toCurrency.toLowerCase(),
      from_amount: body.amount.toString(),
      user_id: session.user.id
    });

    // Create swap quotation if rate looks good
    const quotation = await QuidaxService.createSwapQuotation({
      user_id: session.user.id,
      from_currency: body.fromCurrency.toLowerCase(),
      to_currency: body.toCurrency.toLowerCase(),
      from_amount: body.amount.toString()
    });

    return NextResponse.json({
      marketRate: {
        buy: marketRate.ticker.last,
        sell: marketRate.ticker.last,
        last: marketRate.ticker.last,
        volume: marketRate.ticker.vol,
        high: marketRate.ticker.high,
        low: marketRate.ticker.low
      },
      tempQuote,
      quotation
    });
  } catch (error) {
    console.error('Trade quotation error:', error);
    return NextResponse.json(
      { error: 'Failed to get trade quotation' },
      { status: 500 }
    );
  }
}