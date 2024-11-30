//app/api/trades/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TradeFlow } from '@/app/lib/services/trade-flow';
import { getCurrentUser } from '@/app/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tradeDetails = await request.json();
    const result = await TradeFlow.createSellOrder({
      ...tradeDetails,
      user_id: user.id
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trade creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}