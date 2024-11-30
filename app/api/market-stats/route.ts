// app/api/market-stats/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/global'
    );

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status);
      throw new Error('Failed to fetch market stats');
    }

    const data = await response.json();
    console.log('Market stats API response:', data);
    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error in market-stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market stats' },
      { status: 500 }
    );
  }
}