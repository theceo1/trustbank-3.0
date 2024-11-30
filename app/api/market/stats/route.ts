import { NextResponse } from 'next/server';
import { getNGNRate } from '@/app/lib/utils/exchange-rates';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function GET() {
  try {
    const [cryptoData, ngnRate] = await Promise.all([
      fetch(
        `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 30 }
        }
      ),
      getNGNRate()
    ]);

    if (!cryptoData.ok) {
      throw new Error('Failed to fetch crypto price');
    }

    const data = await cryptoData.json();
    const btcUsdPrice = data.bitcoin?.usd || 0;
    const priceChange = data.bitcoin?.usd_24h_change || 0;

    return NextResponse.json({
      last_price: btcUsdPrice * ngnRate,
      price_change_24h: priceChange,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Market stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market stats' }, 
      { status: 500 }
    );
  }
} 