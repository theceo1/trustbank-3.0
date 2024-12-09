// app/api/wallet/balance/[currency]/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function GET(
  request: Request,
  { params }: { params: { currency: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('currency', params.currency.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }

    return NextResponse.json({
      currency: params.currency.toLowerCase(),
      balance: wallet?.balance?.toString() || '0',
      pending: wallet?.pending_balance?.toString() || '0'
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
