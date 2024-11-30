import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';
import { WalletService } from '@/app/lib/services/wallet';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tradeId, amount } = await request.json();

    // Get trade details
    const { data: trade } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Transfer to exchange wallet
    await WalletService.transferToExchange(user.id, amount);
    
    // Process payment
    const result = await QuidaxService.processWalletPayment(trade.quidax_reference);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Wallet payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process wallet payment' },
      { status: 500 }
    );
  }
}