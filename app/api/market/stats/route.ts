import { NextResponse } from 'next/server';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

export async function GET() {
  try {
    const marketData = await QuidaxMarketService.getAllMarketTickers();
    const ticker = marketData?.data?.btcngn?.ticker;

    if (!ticker) {
      throw new Error('Invalid market data received');
    }

    return new Response(JSON.stringify({
      status: 'success',
      data: {
        last_price: parseFloat(ticker.last),
        high_24h: parseFloat(ticker.high),
        low_24h: parseFloat(ticker.low),
        volume_24h: parseFloat(ticker.vol),
        open_24h: parseFloat(ticker.open)
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Market Stats API] Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'Failed to fetch market stats'
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 