import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market')?.toLowerCase() || 'btcngn';

    // Return WebSocket URL
    return NextResponse.json({
      status: 'success',
      data: {
        wsUrl: process.env.NODE_ENV === 'development' 
          ? `ws://localhost:3001/ws/market/${market}` 
          : `wss://${process.env.VERCEL_URL}/ws/market/${market}`
      }
    });
  } catch (error) {
    console.error('Error getting WebSocket URL:', error);
    return NextResponse.json(
      { error: 'Failed to get WebSocket URL' },
      { status: 500 }
    );
  }
} 