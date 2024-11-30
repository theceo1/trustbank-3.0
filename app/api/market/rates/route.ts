import { NextResponse } from 'next/server';
import { getNGNRate } from '@/app/lib/utils/exchange-rates';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coin');
    
    if (!coinId) {
      return NextResponse.json({ error: 'Coin ID is required' }, { status: 400 });
    }

    const [cryptoData, ngnRate] = await Promise.all([
      fetch(
        `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 10 }
        }
      ),
      getNGNRate()
    ]);

    if (!cryptoData.ok) {
      throw new Error('Failed to fetch crypto price');
    }

    const data = await cryptoData.json();
    
    return NextResponse.json({
      usdRate: data[coinId]?.usd || 0,
      ngnRate,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Market rate fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
  }
} 