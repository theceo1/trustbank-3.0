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
    const market = currency_pair.toLowerCase();
    const response = await fetch(
      `${QUIDAX_API_BASE_URL}/markets/tickers/${market}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rate');
    }

    const data = await response.json();
    
    if (!data?.data?.ticker) {
      throw new Error('Invalid quote response');
    }

    const ticker = data.data.ticker;
    const rate = type === 'buy' ? parseFloat(ticker.sell) : parseFloat(ticker.buy);
    const total = rate * amount;
    
    // Calculate fees using the constants
    const fees = calculateTradeFees(total);

    return {
      rate,
      amount,
      total,
      fees,
      expiresAt: Date.now() + RATE_EXPIRY_TIME
    };
  }
}