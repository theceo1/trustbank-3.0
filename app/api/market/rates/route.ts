//app/api/market/rates/route.ts
import { NextResponse } from 'next/server';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market')?.toLowerCase() || 'btcngn';
    
    // Validate market parameter against allowed values
    const validMarkets = ['btcngn', 'ethngn', 'usdtngn', /* add other valid markets */];
    if (!validMarkets.includes(market)) {
      return NextResponse.json({ 
        error: 'Invalid market parameter',
        details: 'Market not supported'
      }, { 
        status: 400 
      });
    }
    
    const marketData = await QuidaxMarketService.getMarketTicker(market);
    
    if (!marketData?.ticker) {
      throw new Error('Invalid market data received');
    }

    // Calculate price change percentage if not provided
    const priceChange = marketData.ticker.price_change_percent 
      ? parseFloat(marketData.ticker.price_change_percent)
      : ((parseFloat(marketData.ticker.last) - parseFloat(marketData.ticker.open)) / parseFloat(marketData.ticker.open)) * 100;

    return NextResponse.json({
      status: 'success',
      data: {
        price: parseFloat(marketData.ticker.last),
        volume_24h: parseFloat(marketData.ticker.volume),
        price_change_24h: priceChange,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Market rate fetch error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: 'Failed to fetch rates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 