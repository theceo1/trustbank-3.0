//app/api/crypto/rate/[currency]/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const segments = request.url.split('/');
  const currency = segments[segments.length - 1].toUpperCase();
  
  try {
    // For USDT/NGN rate
    const response = await fetch(
      `https://www.quidax.com/api/v1/markets/tickers/usdtngn`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rate');
    }

    const data = await response.json();
    const rate = parseFloat(data.ticker.last);

    if (currency === 'USDT' || currency === 'USDC') {
      return NextResponse.json({ 
        rate,
        usdPrice: 1 
      });
    }

    // For other cryptocurrencies, get their USDT rate first
    const cryptoResponse = await fetch(
      `https://www.quidax.com/api/v1/markets/tickers/${currency.toLowerCase()}usdt`
    );

    if (!cryptoResponse.ok) {
      throw new Error('Failed to fetch crypto price');
    }

    const cryptoData = await cryptoResponse.json();
    const usdPrice = parseFloat(cryptoData.ticker.last);
    
    return NextResponse.json({ 
      rate: usdPrice * rate,
      usdPrice 
    });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate' },
      { status: 500 }
    );
  }
}