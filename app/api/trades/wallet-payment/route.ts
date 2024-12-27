// app/api/trades/wallet-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ 
      cookies
    });
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tradeId } = await request.json();

    // Get trade details and user's Quidax ID
    const { data: trade } = await supabase
      .from('trades')
      .select('*, users!inner(quidax_id)')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    if (!trade.users.quidax_id) {
      return NextResponse.json(
        { error: 'User not properly setup' },
        { status: 400 }
      );
    }

    // Confirm the quotation
    const result = await QuidaxService.confirmQuotation({
      userId: trade.users.quidax_id,
      quotationId: trade.quidax_reference
    });

    // Update trade status
    await supabase
      .from('trades')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', tradeId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Wallet payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process wallet payment' },
      { status: 500 }
    );
  }
}