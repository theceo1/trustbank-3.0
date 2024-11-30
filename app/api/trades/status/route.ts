import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get('tradeId');

    if (!tradeId) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trade from database
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Get latest status from Quidax
    const paymentDetails = await QuidaxService.getPaymentDetails(trade.quidax_reference);
    
    // Update trade status if changed
    if (paymentDetails.status !== trade.status) {
      await supabase
        .from('trades')
        .update({ 
          status: QuidaxService.mapQuidaxStatus(paymentDetails.status),
          updated_at: new Date().toISOString()
        })
        .eq('id', tradeId);
    }

    return NextResponse.json({
      status: paymentDetails.status,
      paymentDetails
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check trade status' },
      { status: 500 }
    );
  }
}