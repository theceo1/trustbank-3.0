import { MarketStats, MarketTicker, MarketQuote } from '@/app/types/market';

export class MarketService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  
  static async getAllMarkets() {
    return this.makeRequest('/markets');
  }

  static async getMarketTicker(market: string = 'btcngn'): Promise<MarketTicker> {
    return this.makeRequest(`/markets/tickers/${market}`);
  }

  static async getAllMarketTickers(): Promise<Record<string, MarketTicker>> {
    return this.makeRequest('/markets/tickers');
  }

  static async getQuote(params: {
    market: string;
    unit: string;
    kind: 'ask' | 'bid';
    volume: string;
  }): Promise<MarketQuote> {
    const queryParams = new URLSearchParams(params);
    return this.makeRequest(`/quotes?${queryParams}`);
  }

  static async getMarketStats(pair: string): Promise<MarketStats> {
    return this.makeRequest(`/markets/${pair}/stats`);
  }

  static async getKLine(market: string, params?: {
    period?: number;
    limit?: number;
    timestamp?: number;
  }) {
    const queryParams = new URLSearchParams(params as any);
    return this.makeRequest(`/markets/${market}/k?${queryParams}`);
  }

  static async getOrderBook(market: string, params?: {
    asks_limit?: number;
    bids_limit?: number;
  }) {
    const queryParams = new URLSearchParams(params as any);
    return this.makeRequest(`/markets/${market}/order_book?${queryParams}`);
  }

  private static async makeRequest(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 30 }
      });

      if (!response.ok) {
        throw new Error(`Market API request failed: ${response.statusText}`);
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Market service error:', error);
      throw error;
    }
  }
}