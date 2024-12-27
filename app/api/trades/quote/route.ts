//app/api/trades/quote/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';
import type { Database } from '@/types/supabase';

interface QuoteResponse {
  volume: { amount: string };
  price: { amount: string };
  receive: { amount: string };
  fee: { amount: string };
  total: { amount: string };
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fromCurrency, toCurrency, amount } = await request.json();
    
    // Get temporary quote first
    const quote = await QuidaxService.getQuote({
      market: `${fromCurrency}${toCurrency}`.toLowerCase(),
      unit: fromCurrency.toLowerCase(),
      kind: 'ask',
      volume: amount.toString()
    }) as QuoteResponse;

    return NextResponse.json({
      fromCurrency,
      toCurrency,
      amount: parseFloat(quote.volume.amount),
      rate: parseFloat(quote.price.amount),
      estimatedAmount: parseFloat(quote.receive.amount),
      fee: parseFloat(quote.fee.amount),
      total: parseFloat(quote.total.amount),
      expiresIn: 14
    });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json(
      { error: 'Failed to get quote' },
      { status: 500 }
    );
  }
} 