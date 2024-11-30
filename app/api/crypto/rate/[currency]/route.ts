import { NextResponse } from 'next/server';
import { currencyIds } from '@/app/lib/constants/crypto';

type SupportedCurrency = keyof typeof currencyIds;

export async function GET(request: Request) {
  const segments = request.url.split('/');
  const currency = segments[segments.length - 1].toUpperCase() as SupportedCurrency;
  const ngnRate = 1350;
  
  try {
    if (!(currency in currencyIds)) {
      return NextResponse.json(
        { error: 'Unsupported currency' }, 
        { status: 400 }
      );
    }

    if (currency === 'USDT' || currency === 'USDC') {
      return NextResponse.json({ 
        rate: ngnRate,
        usdPrice: 1 
      });
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${currencyIds[currency]}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }

    const data = await response.json();
    const usdPrice = data[currencyIds[currency]].usd;
    const rate = usdPrice * ngnRate;

    return NextResponse.json({ rate, usdPrice });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate' },
      { status: 500 }
    );
  }
}