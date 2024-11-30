import { NextResponse } from 'next/server';
import { CryptoData } from '@/app/types/market';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export async function GET() {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    const formattedData: CryptoData[] = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      total_volume: coin.total_volume,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      circulating_supply: coin.circulating_supply || 0,
      total_supply: coin.total_supply || 0,
      ath: coin.ath || 0,
      ath_change_percentage: coin.ath_change_percentage || 0,
      ath_date: coin.ath_date || ''
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}