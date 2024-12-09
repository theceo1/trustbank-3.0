//app/api/crypto/prices/route.ts

import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

let cachedData: any = null;
let lastFetch = 0;
const CACHE_DURATION = 10000; // 10 seconds

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => Promise.resolve(cookieStore) 
    });

    const now = Date.now();
    
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-api-key': process.env.COINGECKO_API_KEY as string
        },
        next: { revalidate: 10 }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }

    const data = await response.json();
    
    const prices = {
      'BTCUSDT': data.bitcoin?.usd || 0,
      'ETHUSDT': data.ethereum?.usd || 0,
      'USDTUSDT': data.tether?.usd || 1,
      'USDCUSDT': data['usd-coin']?.usd || 1
    };

    cachedData = prices;
    lastFetch = now;

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    // Return cached data if available, otherwise return error
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    );
  }
}