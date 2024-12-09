import { TradeRateResponse } from '@/app/types/trade';

export class MarketRateService {
  private static BASE_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
  private static API_KEY = process.env.NEXT_PUBLIC_QUIDAX_API_KEY;

  static async getRate({ amount, currency_pair, type }: {
    amount: number;
    currency_pair: string;
    type: 'buy' | 'sell';
  }): Promise<TradeRateResponse> {
    try {
      const [fromCurrency, toCurrency] = currency_pair.split('_');
      const response = await fetch(
        `${this.BASE_URL}/api/v1/quotes?` + 
        new URLSearchParams({
          market: `${fromCurrency}${toCurrency}`,
          unit: fromCurrency,
          kind: type === 'sell' ? 'bid' : 'ask',
          volume: amount.toString()
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get rate');
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to get rate');
      }

      return {
        rate: Number(data.data.price.amount),
        total: Number(data.data.total.amount),
        fees: {
          quidax: Number(data.data.fee.amount),
          platform: 0,
          processing: 0
        }
      };
    } catch (error) {
      console.error('Get rate error:', error);
      throw error;
    }
  }
}