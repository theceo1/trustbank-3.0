// app/api/trade/rate/route.ts
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import { TradeRateResponse } from '@/app/types/trade';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency_pair, type } = body;

    const quidaxRate = await QuidaxService.getInstantRate({
      amount,
      currency_pair,
      type
    });

    // Format response and convert string amounts to numbers
    const rate: TradeRateResponse = {
      rate: Number(quidaxRate.rate),
      total: Number(quidaxRate.total),
      fees: {
        quidax: Number(quidaxRate.fees.quidax),
        platform: Number(quidaxRate.fees.platform),
        processing: Number(quidaxRate.fees.processing)
      }
    };

    return NextResponse.json(rate);
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate' },
      { status: 500 }
    );
  }
} 