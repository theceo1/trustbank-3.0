import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://www.quidax.com/api/v1/markets/tickers', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 10 } // Revalidate every 10 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market rates');
    }

    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid response from Quidax API');
    }

    // Transform the data to a more usable format
    const transformedData = Object.entries(data.data).reduce((acc: any, [market, details]: [string, any]) => {
      acc[market] = {
        last: details.ticker.last,
        high: details.ticker.high,
        low: details.ticker.low,
        volume: details.ticker.vol,
        change: details.ticker.price_change_percent,
        market_id: market
      };
      return acc;
    }, {});

    return NextResponse.json({
      status: 'success',
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching market rates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market rates' },
      { status: 500 }
    );
  }
} 