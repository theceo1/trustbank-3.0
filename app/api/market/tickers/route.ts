import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://www.quidax.com/api/v1/markets/tickers', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market rates');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market rates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market rates' },
      { status: 500 }
    );
  }
} 