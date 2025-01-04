import { NextResponse } from 'next/server';

const QUIDAX_API_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';

export async function GET() {
  try {
    const response = await fetch(
      `${QUIDAX_API_URL}/markets/tickers`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch market data:', await response.text());
      throw new Error('Failed to fetch market data');
    }

    const data = await response.json();
    console.log('Market data received:', data);

    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid market data received');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tickers API:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch market data'
      },
      { status: 500 }
    );
  }
} 