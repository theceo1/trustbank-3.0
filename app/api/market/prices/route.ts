import { QuidaxMarketService } from '@/lib/services/quidax-market';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await QuidaxMarketService.getAllMarketTickers();
    const tickers = response.data;
    
    return NextResponse.json({
      status: 'success',
      data: {
        btc: tickers.btcngn?.ticker || null,
        eth: tickers.ethngn?.ticker || null,
        usdt: tickers.usdtngn?.ticker || null
      }
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch market prices' },
      { status: 500 }
    );
  }
} 