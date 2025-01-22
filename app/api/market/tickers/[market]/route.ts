import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/lib/services/quidax-client';

export async function GET(request: Request, { params }: { params: { market: string } }) {
  try {
    const quidax = QuidaxClient.getInstance();
    const marketId = params.market.toLowerCase();
    
    console.log(`[Market Ticker] Fetching ticker for market: ${marketId}`);
    const data = await quidax.getTicker(marketId);
    
    return NextResponse.json({
      status: 'success',
      data,
      message: 'Market ticker fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching market ticker:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch market ticker' },
      { status: 500 }
    );
  }
} 