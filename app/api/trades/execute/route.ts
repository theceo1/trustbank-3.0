// app/api/trades/execute/route.ts
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import type { QuidaxSwapTransaction } from '@/app/types/quidax';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
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

    // Create swap quotation if not provided
    let quotationId = quoteId;
    if (!quotationId) {
      const quotation = await QuidaxService.createSwapQuotation({
        user_id: userData.quidax_id,
        from_currency: fromCurrency.toLowerCase(),
        to_currency: toCurrency.toLowerCase(),
        from_amount: amount.toString()
      });
      quotationId = quotation.id;
    }

    // Confirm the trade
    const trade = await QuidaxService.confirmSwapQuotation({
      user_id: userData.quidax_id,
      quotation_id: quotationId
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