//app/lib/services/market-rate.ts
import { TradeRateResponse } from '@/app/types/trade';
import { FEES, calculateTradeFees } from '@/app/lib/constants/fees';

const QUIDAX_API_BASE_URL = 'https://www.quidax.com/api/v1';
const RATE_EXPIRY_TIME = 14000; // 14 seconds

export class MarketRateService {
  static async getRate({ amount, currency_pair, type }: {
    amount: number;
    currency_pair: string;
    type: 'buy' | 'sell';
  }): Promise<TradeRateResponse> {
    try {
      const market = currency_pair.toLowerCase();
      const response = await fetch(
        `${QUIDAX_API_BASE_URL}/markets/tickers/${market}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-store' // Ensure we get fresh rates
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch rate: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Quidax returns data in format { ticker: { ... } }
      if (!data?.ticker) {
        throw new Error('Invalid market data received');
      }

      // Get the appropriate rate based on trade type
      const rate = type === 'buy' ? 
        parseFloat(data.ticker.sell || data.ticker.ask) : 
        parseFloat(data.ticker.buy || data.ticker.bid);

      if (!rate || isNaN(rate)) {
        throw new Error('Invalid rate received');
      }

      const total = rate * amount;
      const fees = calculateTradeFees(total);

      return {
        rate,
        amount,
        total,
        fees,
        expiresAt: Date.now() + RATE_EXPIRY_TIME
      };
    } catch (error) {
      console.error('Market rate fetch error:', error);
      throw error;
    }
  }
}