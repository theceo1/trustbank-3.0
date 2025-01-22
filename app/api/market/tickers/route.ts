import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/quidax';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const quidax = new QuidaxClient();
    const response = await quidax.get('/markets/tickers');
    
    if (!response.ok) {
      throw new Error('Failed to fetch market tickers');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 