import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toLowerCase();
  const timeframe = searchParams.get('timeframe');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    let days;
    switch (timeframe) {
      case '1H':
        days = '1';
        break;
      case '24H':
        days = '1';
        break;
      case '7D':
        days = '7';
        break;
      case '30D':
        days = '30';
        break;
      case 'ALL':
        days = 'max';
        break;
      default:
        days = '1';
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}