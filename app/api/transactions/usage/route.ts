import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's and this month's start dates
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get transactions for the current day and month
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('user_id', user.id)
      .gte('created_at', monthStart);

    if (txError) {
      console.error('Error fetching transactions:', txError);
      return NextResponse.json(
        { error: 'Failed to fetch transaction data' },
        { status: 500 }
      );
    }

    // Calculate daily and monthly totals
    const dailyTotal = transactions
      .filter(tx => tx.created_at >= todayStart)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const monthlyTotal = transactions
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return NextResponse.json({
      daily: dailyTotal,
      monthly: monthlyTotal
    });
  } catch (error) {
    console.error('Error in transaction usage route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 