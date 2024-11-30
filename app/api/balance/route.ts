import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export interface BalanceResponse {
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: balance } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json(balance || { total: 0, available: 0, pending: 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
