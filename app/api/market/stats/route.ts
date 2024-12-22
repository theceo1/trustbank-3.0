import { NextResponse } from 'next/server';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

export async function GET() {
  try {
    const marketData = await QuidaxMarketService.getMarketTicker('btcngn');
    
    return NextResponse.json({
      last_price: parseFloat(marketData.ticker.last),
      price_change_24h: parseFloat(marketData.ticker.price_change_percent),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Market stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market stats' }, 
      { status: 500 }
    );
  }
} 