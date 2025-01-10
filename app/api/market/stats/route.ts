import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();

    if (!data || !data.data) {
      throw new Error('Invalid market data received');
    }

    return NextResponse.json({
      success: true,
      data: data.data
    });
  } catch (error) {
    console.error('[Market Stats API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch market stats'
    }, { status: 500 });
  }
} 