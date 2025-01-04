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
  message: string;
  data: Record<string, MarketTickerData>;
}

export class QuidaxMarketService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';

  static async getAllMarketTickers(): Promise<MarketTickersResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/markets/tickers`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store' // Ensure we get fresh rates
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market tickers');
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

  static async getMarketTicker(market: string): Promise<MarketTickerData> {
    try {
      const response = await fetch(`${this.BASE_URL}/markets/tickers/${market}`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store' // Ensure we get fresh rates
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch market ticker for ${market}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success' || !data.data) {
        throw new Error(`Invalid market data received for ${market}`);
      }

      return data.data;
    } catch (error) {
      console.error(`Error fetching market ticker for ${market}:`, error);
      throw error;
    }
  }

  static async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    try {
      const queryParams = new URLSearchParams({
        market: params.market,
        unit: params.unit,
        kind: params.kind,
        volume: params.volume.toString()
      });

      const response = await fetch(
        `${this.BASE_URL}/quotes?${queryParams.toString()}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid quote data received');
      }

      return {
        rate: parseFloat(data.data.price.amount),
        total: parseFloat(data.data.total.amount),
        fee: parseFloat(data.data.fee.amount),
        receive: parseFloat(data.data.receive.amount)
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }
} 