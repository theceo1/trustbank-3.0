import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

export async function GET(
  request: Request,
  { params }: { params: { market: string } }
) {
  try {
    const market = params.market;
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    const orderBook = await quidaxClient.fetchOrderBook(market);

    return NextResponse.json({
      status: 'success',
      data: orderBook
    });
  } catch (error) {
    console.error('[API] Order book error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to fetch order book' 
      },
      { status: 500 }
    );
  }
} 