//app/api/trades/create/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TradeFlow } from '@/app/lib/services/trade-flow';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeDetails = await request.json();
    const result = await TradeFlow.initializeTrade({
      ...tradeDetails,
      user_id: user.id
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trade creation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create trade' },
      { status: 500 }
    );
  }
}