import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.quidax.com/api/v1/markets/tickers', {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market tickers');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market tickers:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to fetch market rates',
        // Return mock data in development
        ...(process.env.NODE_ENV === 'development' && {
          data: {
            btcngn: {
              name: 'BTC/NGN',
              base_unit: 'btc',
              quote_unit: 'ngn',
              low: '43000000.0',
              high: '44500000.0',
              last: '44000000.0',
              open: '43500000.0',
              volume: '12.3',
              sell: '44100000.0',
              buy: '43900000.0'
            },
            ethngn: {
              name: 'ETH/NGN',
              base_unit: 'eth',
              quote_unit: 'ngn',
              low: '2200000.0',
              high: '2300000.0',
              last: '2250000.0',
              open: '2220000.0',
              volume: '45.2',
              sell: '2260000.0',
              buy: '2240000.0'
            },
            usdtngn: {
              name: 'USDT/NGN',
              base_unit: 'usdt',
              quote_unit: 'ngn',
              low: '1195.0',
              high: '1205.0',
              last: '1200.0',
              open: '1198.0',
              volume: '125000.0',
              sell: '1202.0',
              buy: '1198.0'
            }
          }
        })
      },
      { status: 500 }
    );
  }
} 