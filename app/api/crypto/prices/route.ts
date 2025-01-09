//app/api/crypto/prices/route.ts

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type Currency = 'btc' | 'eth' | 'usdt' | 'usdc';
type Quote = 'usd' | 'ngn';

interface PriceData {
  [key: string]: {
    [key: string]: number;
  };
}

const MOCK_PRICES: PriceData = {
  btc: { usd: 45000, ngn: 33750000 },
  eth: { usd: 2500, ngn: 1875000 },
  usdt: { usd: 1, ngn: 750 },
  usdc: { usd: 1, ngn: 750 }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get('currency')?.toLowerCase() || 'btc') as Currency;
    const quote = (searchParams.get('quote')?.toLowerCase() || 'usd') as Quote;

    if (!MOCK_PRICES[currency]) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    if (!MOCK_PRICES[currency][quote]) {
      return NextResponse.json(
        { error: 'Invalid quote currency' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: {
        currency,
        quote,
        price: MOCK_PRICES[currency][quote]
      }
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    );
  }
}