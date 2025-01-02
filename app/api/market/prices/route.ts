import { NextResponse } from 'next/server';
import { APIError, handleAPIError } from '@/lib/api-utils';

const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

interface QuidaxTicker {
  name: string;
  base_unit: string;
  quote_unit: string;
  low: string;
  high: string;
  last: string;
  volume: string;
  change: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  orderBook?: {
    asks: [string, string][];
    bids: [string, string][];
  };
  trades?: {
    price: string;
    volume: string;
    timestamp: string;
    side: 'sell' | 'buy';
  }[];
}

async function fetchOrderBook(market: string): Promise<{ asks: [string, string][]; bids: [string, string][]; } | undefined> {
  try {
    const response = await fetch(`${QUIDAX_API_URL}/markets/${market}/order_book`);
    if (!response.ok) {
      throw new APIError(`Failed to fetch order book: ${response.statusText}`, response.status);
    }
    const data = await response.json();
    if (data.status === 'success' && data.data) {
      return {
        asks: data.data.asks.slice(0, 5), // Get top 5 asks
        bids: data.data.bids.slice(0, 5)  // Get top 5 bids
      };
    }
    throw new APIError('Invalid order book data received', 500);
  } catch (error) {
    console.error(`Error fetching order book for ${market}:`, error);
    throw error;
  }
}

async function fetchMarketTrades(market: string) {
  try {
    const response = await fetch(`${QUIDAX_API_URL}/markets/${market}/trades`);
    if (!response.ok) {
      throw new APIError(`Failed to fetch trades: ${response.statusText}`, response.status);
    }
    const data = await response.json();
    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data.slice(0, 10); // Get last 10 trades
    }
    throw new APIError('Invalid trades data received', 500);
  } catch (error) {
    console.error(`Error fetching trades for ${market}:`, error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const market = url.searchParams.get('market');
    const includeOrderBook = url.searchParams.get('orderBook') === 'true';
    const includeTrades = url.searchParams.get('trades') === 'true';

    // Validate market parameter if provided
    if (market && !/^[a-z]+ngn$/.test(market)) {
      throw new APIError('Invalid market parameter', 400);
    }

    // Fetch market tickers
    const response = await fetch(`${QUIDAX_API_URL}/markets/tickers`);
    if (!response.ok) {
      throw new APIError(`Failed to fetch market data: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    if (!data || data.status !== 'success' || !data.data?.tickers) {
      throw new APIError('Invalid market data received', 500);
    }

    // Format the tickers data
    const markets = Object.entries(data.data.tickers)
      .filter(([marketPair]) => market ? marketPair === market : marketPair.endsWith('ngn'))
      .map(async ([marketPair, ticker]: [string, QuidaxTicker]) => {
        try {
          const marketData: MarketData = {
            symbol: ticker.base_unit,
            price: parseFloat(ticker.last) || 0,
            change24h: parseFloat(ticker.change) || 0,
            volume: parseFloat(ticker.volume) || 0,
            high24h: parseFloat(ticker.high) || 0,
            low24h: parseFloat(ticker.low) || 0
          };

          // Fetch additional data if requested
          if (includeOrderBook) {
            marketData.orderBook = await fetchOrderBook(marketPair);
          }

          if (includeTrades) {
            marketData.trades = await fetchMarketTrades(marketPair);
          }

          return marketData;
        } catch (error) {
          console.error(`Error processing market ${marketPair}:`, error);
          return null;
        }
      });

    const prices = (await Promise.all(markets)).filter(Boolean);

    if (prices.length === 0) {
      throw new APIError('No market data available', 404);
    }

    return NextResponse.json({
      status: 'success',
      data: prices
    });
  } catch (error) {
    return handleAPIError(error);
  }
} 