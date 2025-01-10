// app/api/trade/rate/route.ts
import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market');

    if (!market) {
      return NextResponse.json(
        { error: 'Market parameter is required' },
        { status: 400 }
      );
    }

    // Split market into base and quote (e.g., 'btcngn' -> ['btc', 'ngn'])
    const base = market.slice(0, -3);
    const quote = market.slice(-3);

    console.log(`[TradeRate] Getting rate for market: ${market} (${base}/${quote})`);
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    const response = await quidaxClient.getRate(base, quote);

    return NextResponse.json({
      status: 'success',
      message: 'Rate retrieved successfully',
      data: { rate: response }
    });

  } catch (error: any) {
    console.error('[TradeRate] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to get rate',
      },
      { status: error.status || 500 }
    );
  }
} 