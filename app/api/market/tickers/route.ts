import { NextResponse } from 'next/server';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

export async function GET() {
  try {
    const response = await fetch('https://www.quidax.com/api/v1/markets/tickers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    const data = await response.json();
    console.log('Quidax API Response:', JSON.stringify(data, null, 2));
    
    if (!data.data) {
      throw new Error('Invalid response format');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 