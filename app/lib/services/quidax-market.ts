//app/lib/services/quidax-market.ts
import { QuidaxClient } from './quidax-client';

interface QuoteParams {
  market: string;
  unit: string;
  kind: 'buy' | 'sell';
  volume: number;
}

interface QuoteResponse {
  rate: number;
  total: number;
  fee: number;
  receive: number;
}

interface MarketTickerData {
  name: string;
  base_unit: string;
  quote_unit: string;
  ticker: {
    buy: string;
    sell: string;
    low: string;
    high: string;
    open: string;
    last: string;
    vol: string;
  };
}

interface MarketTickersResponse {
  status: string;
  data: Record<string, MarketTickerData>;
}

interface MarketPriceResponse {
  status: string;
  data: {
    price: {
      amount: string;
      unit: string;
    };
  };
}

export class QuidaxMarketService {
  private static readonly BASE_URL = '/api/market';

  static async getAllMarketTickers(): Promise<MarketTickersResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/tickers`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market data');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid market data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching market tickers:', error);
      throw error;
    }
  }

  static async getMarketPrice(market: string): Promise<MarketPriceResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/prices?market=${market}`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market price');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid market price data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching market price:', error);
      throw error;
    }
  }
} 