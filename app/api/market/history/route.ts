import { NextResponse } from "next/server";
import { QuidaxClient } from '@/lib/services/quidax-client';

export const runtime = "edge";
export const preferredRegion = ["iad1"];
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const market = searchParams.get('market');
    const period = searchParams.get('period') || '24h';

    if (!market) {
      return NextResponse.json(
        { status: 'error', message: 'Market parameter is required' },
        { status: 400 }
      );
    }

    // Format market parameter (e.g., btcngn -> btc_ngn)
    const formattedMarket = market.replace(/([a-z]+)([a-z]{3})$/, '$1_$2');
    
    console.log('Fetching market history:', { market: formattedMarket, period });
    
    const quidax = QuidaxClient.getInstance();
    const data = await quidax.getMarketHistory(formattedMarket, period);
    
    if (!data) {
      console.error('No data returned from Quidax API');
      return NextResponse.json(
        { status: 'error', message: 'No data available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data,
      message: 'Market history fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching market history:', {
      error: error.message,
      stack: error.stack,
      market: searchParams.get('market'),
      period: searchParams.get('period')
    });
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message || 'Failed to fetch market history',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

function generateMockHistoryData() {
  const data = [];
  const now = Date.now();
  const basePrice = 45000; // Base price for mock data
  
  // Generate 24 hours of data points (1 per hour)
  for (let i = 0; i < 24; i++) {
    const time = now - (i * 60 * 60 * 1000); // Go back i hours
    const randomChange = (Math.random() - 0.5) * 1000; // Random price change
    
    data.unshift({
      timestamp: time,
      price: basePrice + randomChange
    });
  }
  
  return data;
} 