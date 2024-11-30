import { TradeRateResponse } from '@/app/types/trade';
import { FEES } from '../constants/fees';

export class MarketRateService {
  static async getRate({ amount, currency_pair, type }: {
    amount: number;
    currency_pair: string;
    type: 'buy' | 'sell';
  }): Promise<TradeRateResponse> {
    try {
      const [crypto] = currency_pair.split('_');
      const coinId = this.getCoinId(crypto);
      
      const response = await fetch(`/api/market/rates?coin=${coinId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market rate');
      }

      const { usdRate, ngnRate } = await response.json();
      
      // Calculate fees
      const quidaxFee = amount * FEES.QUIDAX;
      const platformFee = amount * FEES.PLATFORM;
      const processingFee = amount * FEES.PROCESSING;
      
      const total = type === 'buy' 
        ? amount + quidaxFee + platformFee + processingFee
        : amount - (quidaxFee + platformFee + processingFee);

      return {
        rate: ngnRate,
        usdRate,
        total,
        fees: {
          quidax: quidaxFee,
          platform: platformFee,
          processing: processingFee
        }
      };
    } catch (error) {
      console.error('Market rate fetch error:', error);
      throw error;
    }
  }

  private static getCoinId(currency: string): string {
    const coinIds: Record<string, string> = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'usdt': 'tether',
      'usdc': 'usd-coin'
    };
    return coinIds[currency.toLowerCase()] || currency.toLowerCase();
  }
} 