import { NextResponse } from 'next/server';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market') || 'btcngn';
    
    const marketData = await QuidaxMarketService.getMarketTicker(market);
    
    if (!marketData?.ticker) {
      throw new Error('Invalid market data received');
    }

    return NextResponse.json({
      price: parseFloat(marketData.ticker.last),
      volume_24h: parseFloat(marketData.ticker.volume),
      price_change_24h: parseFloat(marketData.ticker.price_change_percent),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Market rate fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 