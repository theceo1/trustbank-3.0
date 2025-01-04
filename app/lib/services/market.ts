//app/lib/services/market.ts
import { QuidaxMarketService } from './quidax-market';
import type { MarketRates, QuidaxTicker } from '@/app/lib/types/market';

interface MarketRateData {
  last: string;
  high?: string;
  low?: string;
  volume?: string;
  change?: string;
}

interface MarketResponse {
  status: 'success' | 'error';
  data?: Record<string, MarketRateData>;
  error?: string;
}

export class MarketService {
  private static instance: MarketService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  }

  static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  static async getMarketRate(fromCurrency: string, toCurrency: string): Promise<MarketResponse> {
    try {
      const market = `${fromCurrency.toLowerCase()}${toCurrency.toLowerCase()}`;
      const response = await fetch(`/api/market/prices?market=${market}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch market rates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching market rate:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch market rates'
      };
    }
  }

  async getAllMarketRates(): Promise<MarketResponse> {
    try {
      const response = await fetch('/api/market/prices');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch market rates');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all market rates:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch market rates'
      };
    }
  }
}

// Helper function to get market service instance
export function getMarketService(): MarketService {
  return MarketService.getInstance();
} 