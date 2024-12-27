// app/api/trades/execute/route.ts
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import type { QuidaxSwapTransaction } from '@/app/types/quidax';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: async () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please login to continue' }, 
        { status: 401 }
      );
    }

    const { fromCurrency, toCurrency, amount, quoteId } = await request.json();

    // Get user's Quidax ID
    const { data: userData } = await supabase
      .from('users')
      .select('quidax_id')
      .eq('id', session.user.id)
      .single();

    if (!userData?.quidax_id) {
      return NextResponse.json(
        { error: 'Please complete your account setup to trade' },
        { status: 400 }
      );
    }

    // Create quotation if not provided
    let quotationId = quoteId;
    if (!quotationId) {
      const quotation = await QuidaxService.createQuotation({
        userId: userData.quidax_id,
        fromCurrency: fromCurrency.toLowerCase(),
        toCurrency: toCurrency.toLowerCase(),
        fromAmount: amount.toString()
      });
      quotationId = quotation.id;
    }

    // Confirm the trade
    const trade = await QuidaxService.confirmQuotation({
      userId: userData.quidax_id,
      quotationId
    }) as QuidaxSwapTransaction;

    // Store trade in database
    const { data: tradeRecord } = await supabase
      .from('trades')
      .insert({
        user_id: session.user.id,
        quidax_trade_id: trade.id,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amount,
        status: trade.status,
        rate: trade.execution_price
      })
      .select()
      .single();

    return NextResponse.json({
      tradeId: tradeRecord.id,
      status: trade.status
    });
  } catch (error: any) {
    console.error('Trade execution error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Unable to process trade at this time';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
} 