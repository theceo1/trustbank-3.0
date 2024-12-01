import { NextResponse } from 'next/server';
import { MarketRateService } from '@/app/lib/services/market-rate';

export async function GET(request: Request) {
  const segments = request.url.split('/');
  const pair = segments[segments.length - 1].toLowerCase();
  
  try {
    const rate = await MarketRateService.getRate({
      amount: 1,
      currency_pair: pair,
      type: 'buy'
    });
    return NextResponse.json(rate);
  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate' }, 
      { status: 500 }
    );
  }
} 