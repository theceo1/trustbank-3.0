//app/api/webhooks/quidax/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TradeTransaction } from '@/app/lib/services/tradeTransaction';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const payload = await request.json();

  try {
    const { reference, status, event } = payload;

    // 1. Get trade details
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('quidax_reference', reference)
      .single();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // 2. Update trade status
    if (event === 'instant_swap.completed') {
      await supabase
        .from('trades')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', trade.id);
    } else if (event === 'instant_swap.failed') {
      await TradeTransaction.revertTradeOnFailure(trade.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}