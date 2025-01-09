//app/api/market/rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const market = url.searchParams.get('market');

    if (!market) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Market parameter is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const marketData = await QuidaxMarketService.getAllMarketTickers();
    const ticker = marketData?.data?.[market]?.ticker;
    
    if (!ticker) {
      throw new Error('Invalid market data received');
    }

    return new Response(JSON.stringify({
      status: 'success',
      data: {
        market,
        rate: ticker.last,
        high: ticker.high,
        low: ticker.low,
        volume: ticker.vol,
        open: ticker.open
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Market Rates API] Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'Failed to fetch market rates'
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 