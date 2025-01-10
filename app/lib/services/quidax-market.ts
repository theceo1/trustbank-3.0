//app/lib/services/quidax-market.ts
import { QuidaxClient } from './quidax-client';

interface QuoteParams {
  market: string;
  unit: string;
  kind: 'ask' | 'bid';
  volume: string;
}

interface QuoteResponse {
  status: string;
  message: string;
  data: {
    price: {
      unit: string;
      amount: string;
    };
    total: {
      unit: string;
      amount: string;
    };
    volume: {
      unit: string;
      amount: string;
    };
    fee: {
      unit: string;
      amount: string;
    };
    receive: {
      unit: string;
      amount: string;
    };
  };
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
  data: Record<string, {
    ticker: {
      buy: string;
      sell: string;
      low: string;
      high: string;
      last: string;
      vol: string;
      open: string;
    };
  }>;
}

interface MarketPriceResponse {
  status: string;
  data: {
    price: {
      amount: string;
      unit: string;
    };
    market: string;
    reversed: boolean;
  };
}

interface MarketStatsResponse {
  status: string;
  data: {
    last_price: number;
    high_24h: number;
    low_24h: number;
    volume_24h: number;
    open_24h: number;
  };
}

interface OrderBookResponse {
  status: string;
  data: {
    asks: [string, string][];
    bids: [string, string][];
  };
}

interface MarketQuoteResponse {
  status: string;
  data: {
    price: {
      amount: string;
      unit: string;
    };
    market: string;
    reversed: boolean;
  };
}

export class QuidaxMarketService {
  private static getBaseUrl() {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // For server-side rendering, use the NEXT_PUBLIC_APP_URL environment variable
    // or fallback to a default URL
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  static async getAllMarketTickers(): Promise<MarketTickersResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/market/tickers`, {
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

  static async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/market/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get market quote');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid quote data received');
      }

      return data;
    } catch (error) {
      console.error('Error getting market quote:', error);
      throw error;
    }
  }

  static async getMarketPrice(market: string): Promise<MarketPriceResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/market/prices?market=${market}`, {
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

  static async getQuotes(fromCurrency: string, toCurrency: string, volume: string): Promise<MarketQuoteResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(
        `${baseUrl}/api/market/quotes?from_currency=${fromCurrency}&to_currency=${toCurrency}&volume=${volume}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market quotes');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid market quotes data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching market quotes:', error);
      throw error;
    }
  }

  static async getMarketStats(): Promise<MarketStatsResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/market/stats`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market stats');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid market stats data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching market stats:', error);
      throw error;
    }
  }

  static async getOrderBook(market: string): Promise<OrderBookResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/api/market/orderbook/${market}`, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch order book');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid order book data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw error;
    }
  }
} 