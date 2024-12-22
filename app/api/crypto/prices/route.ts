//app/api/crypto/prices/route.ts

import { NextResponse } from 'next/server';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids') || 'bitcoin,ethereum,tether,usd-coin';
    const vs_currencies = searchParams.get('vs_currencies') || 'usd';

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-api-key': process.env.COINGECKO_API_KEY as string
        },
        next: { revalidate: 10 }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    );
  }
}