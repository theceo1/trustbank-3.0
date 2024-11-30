// app/api/historical-data/route.ts

import { NextResponse } from 'next/server';
import { TimeFrame } from '@/app/types/chart';

const TIME_FRAME_TO_DAYS: Record<TimeFrame, number | string> = {
  '1H': 1,
  '24H': 1,
  '7D': 7,
  '30D': 30,
  'ALL': 'max'
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol')?.toLowerCase();
    const timeFrame = searchParams.get('timeFrame') as TimeFrame;

    if (!symbol || !timeFrame) {
      return NextResponse.json(
        { error: 'Symbol and timeFrame are required' },
        { status: 400 }
      );
    }

    const days = TIME_FRAME_TO_DAYS[timeFrame];
    const interval = timeFrame === '1H' ? 'minutely' : timeFrame === '24H' ? 'hourly' : 'daily';

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: timeFrame === '1H' ? 60 : 300 } // Cache for 1 minute or 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the data for the chart
    const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
      date: new Date(timestamp).toISOString(),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}