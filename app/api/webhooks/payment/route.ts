import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';
import { TradeTransaction } from '@/app/lib/services/tradeTransaction';
import { PaymentProcessorFactory } from '@/app/lib/services/payment/PaymentProcessorFactory';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-quidax-signature');

    if (!QuidaxService.verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('quidax_reference', payload.reference)
      .single();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    const processor = PaymentProcessorFactory.getProcessor(trade.paymentMethod);
    const verificationResult = await processor.verifyPayment(payload.reference);

    if (verificationResult.status === 'failed') {
      await TradeTransaction.revertTradeOnFailure(trade.id);
    }

    await supabase.rpc('update_trade_status', {
      p_trade_id: trade.id,
      p_status: verificationResult.status,
      p_metadata: {
        ...payload,
        verification_result: verificationResult.metadata
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}