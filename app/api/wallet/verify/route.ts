import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('userId', userId)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    return NextResponse.json({
      balance: wallet.balance,
      pending_balance: wallet.pending_balance,
      transactions: transactions
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}