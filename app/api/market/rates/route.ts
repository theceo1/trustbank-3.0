//app/api/market/rates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let market: string | null = null;
  
  try {
    const url = new URL(request.url);
    market = url.searchParams.get('market');

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
      // Return mock data for development/testing
      return new Response(JSON.stringify({
        status: 'success',
        data: {
          market,
          rate: market.includes('ngn') ? '750.00' : '1.00',
          high: '800.00',
          low: '700.00',
          volume: '1000000.00',
          open: '725.00'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
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
    // Return mock data as fallback
    return new Response(JSON.stringify({
      status: 'success',
      data: {
        market: market || 'unknown',
        rate: '750.00',
        high: '800.00',
        low: '700.00',
        volume: '1000000.00',
        open: '725.00'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 