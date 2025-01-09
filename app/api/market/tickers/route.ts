import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/market/tickers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch market tickers');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    return NextResponse.json({ error: 'Failed to fetch market tickers' }, { status: 500 });
  }
} 