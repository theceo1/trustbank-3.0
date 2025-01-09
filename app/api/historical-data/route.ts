// app/api/historical-data/route.ts

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

function generateMockData(days: number = 30): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const now = Date.now();
  const basePrice = 45000;
  const baseVolume = 1000;

  for (let i = 0; i < days; i++) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const randomPriceChange = (Math.random() - 0.5) * 1000;
    const randomVolumeChange = (Math.random() - 0.5) * 200;

    data.push({
      timestamp,
      price: basePrice + randomPriceChange,
      volume: baseVolume + randomVolumeChange
    });
  }

  return data.reverse();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const currency = searchParams.get('currency')?.toLowerCase() || 'btc';

    const historicalData = generateMockData(days);

    return NextResponse.json({
      status: 'success',
      data: {
        currency,
        days,
        history: historicalData
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}