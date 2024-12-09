// app/api/trades/execute/route.ts
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';

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
    
    // Create swap quotation
    const quotation = await QuidaxService.createSwapQuotation({
      user_id: session.user.id,
      from_currency: body.fromCurrency.toLowerCase(),
      to_currency: body.toCurrency.toLowerCase(),
      from_amount: body.amount.toString()
    });

    // Confirm the swap
    const swap = await QuidaxService.confirmSwapQuotation(
      session.user.id,
      quotation.id
    );

    // Create trade record in database
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        user_id: session.user.id,
        from_currency: body.fromCurrency,
        to_currency: body.toCurrency,
        amount: body.amount,
        type: body.type,
        status: 'pending',
        quidax_reference: swap.transactionId
      })
      .select()
      .single();

    if (tradeError) throw tradeError;

    return NextResponse.json({ trade_id: trade.id });
  } catch (error) {
    console.error('Trade execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute trade' },
      { status: 500 }
    );
  }
} 