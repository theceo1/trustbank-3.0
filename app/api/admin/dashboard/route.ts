import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const { data: adminAccess } = await supabase
      .from('admin_access_cache')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!adminAccess?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dashboard data
    const [trades, users, transactions] = await Promise.all([
      supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('users').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    return NextResponse.json({
      trades: trades.data,
      users: users.data,
      transactions: transactions.data
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 