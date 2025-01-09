import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const QUIDAX_API_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';

export async function GET() {
  try {
    const response = await fetch(`${QUIDAX_API_URL}/markets/tickers`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch market tickers: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market tickers' },
      { status: 500 }
    );
  }
} 