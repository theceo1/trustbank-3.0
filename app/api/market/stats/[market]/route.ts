import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { market: string } }
) {
  try {
    const response = await fetch(`https://www.quidax.com/api/v1/markets/tickers/${params.market}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market stats from Quidax');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Market stats error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Failed to fetch market stats' 
      },
      { status: 500 }
    );
  }
} 