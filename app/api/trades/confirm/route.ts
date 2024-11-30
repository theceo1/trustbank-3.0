import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tradeId } = await request.json();

    // Get trade details from Supabase
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Confirm trade on Quidax
    const confirmedTrade = await QuidaxService.confirmInstantOrder(trade.quidax_reference);

    // Update trade status in Supabase
    await supabase
      .from('trades')
      .update({
        status: confirmedTrade.data.status === 'confirm' ? 'processing' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', trade.id);

    return NextResponse.json(confirmedTrade);
  } catch (error: any) {
    console.error('Trade confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm trade' },
      { status: 500 }
    );
  }
} 