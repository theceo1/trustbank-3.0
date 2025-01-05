// app/api/trade/rate/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';

export async function GET(request: Request) {
  try {
    console.log('[TradeRate] Starting to fetch trade rate');
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market');
    
    if (!market) {
      console.error('[TradeRate] No market parameter provided');
      return NextResponse.json(
        { error: 'Market parameter is required' },
        { status: 400 }
      );
    }

    console.log('[TradeRate] Fetching rate for market:', market);
    const quidaxClient = new QuidaxClient();
    const rateData = await quidaxClient.getRate(market);

    console.log('[TradeRate] Rate data received:', rateData);
    return NextResponse.json({
      status: 'success',
      message: 'Rate retrieved successfully',
      data: rateData.data
    });

  } catch (error: any) {
    console.error('[TradeRate] Error fetching rate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rate' },
      { status: 500 }
    );
  }
} 