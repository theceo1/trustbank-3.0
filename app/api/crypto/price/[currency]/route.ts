import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const segments = request.url.split('/');
  const currency = segments[segments.length - 1];
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${currency.toLowerCase()}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }

    const data = await response.json();
    const price = data[currency.toLowerCase()]?.usd;

    if (!price) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price' },
      { status: 500 }
    );
  }
}