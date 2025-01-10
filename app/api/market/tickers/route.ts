import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[Market Tickers] Starting request to Quidax API');
  
  try {
    const baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com';
    const apiUrl = new URL('https://www.quidax.com/api/v1/markets/tickers');
    
    console.log(`[Market Tickers] Requesting URL: ${apiUrl.toString()}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Market Tickers] Non-OK response:', {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json({ 
        status: 'error',
        error: `API request failed with status ${response.status}`
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('[Market Tickers] Successfully fetched data');
    
    return NextResponse.json({ status: 'success', data });
  } catch (error) {
    console.error('[Market Tickers] Error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 