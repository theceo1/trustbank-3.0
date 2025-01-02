//app/lib/services/quidax-market.ts
import { QuidaxMarketTicker, QuidaxQuote } from '@/app/types/quidax';

export class QuidaxMarketService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async getMarketTicker(market: string): Promise<QuidaxMarketTicker> {
    try {
      const formattedMarket = market.toLowerCase();
      
      const response = await fetch(
        `${this.baseUrl}/markets/tickers/${formattedMarket}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch ticker: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success' || !result.data) {
        throw new Error('Invalid market data response');
      }

      return result.data;
    } catch (error) {
      console.error('Market ticker fetch error:', error);
      throw error;
    }
  }

  static async getAllMarketTickers() {
    try {
      const response = await fetch(
        `${this.baseUrl}/markets/tickers`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch tickers: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success' || !result.data?.tickers) {
        throw new Error('Invalid market data response');
      }

      return result.data.tickers;
    } catch (error) {
      console.error('Market tickers fetch error:', error);
      throw error;
    }
  }

  static async getQuote(params: {
    market: string;
    unit: string;
    kind: 'ask' | 'bid';
    volume: string;
  }): Promise<QuidaxQuote> {
    try {
      if (!params.market || !params.unit || !params.kind || !params.volume) {
        throw new Error('Missing required quote parameters');
      }

      const queryParams = new URLSearchParams({
        market: params.market.toLowerCase(),
        unit: params.unit.toLowerCase(),
        kind: params.kind,
        volume: params.volume
      });

      const response = await fetch(
        `${this.baseUrl}/quotes?${queryParams.toString()}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch quote: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success' || !result.data) {
        throw new Error('Invalid quote response');
      }

      return result.data;
    } catch (error) {
      console.error('Quote fetch error:', error);
      throw error;
    }
  }
} 