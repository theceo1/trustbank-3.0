import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PaymentService } from '@/app/lib/services/payment';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference, paymentMethod } = await request.json();
    const processor = await PaymentService.getPaymentProcessor(paymentMethod);
    const result = await processor.verifyPayment(reference);

    if (result.status === 'completed') {
      await supabase.rpc('update_trade_status', {
        p_reference: reference,
        p_status: 'completed',
        p_metadata: result.metadata
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}