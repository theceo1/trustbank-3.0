import { getNGNRate } from '../utils/exchange-rates';

interface CryptoRate {
  rate: number;
  fees: {
    quidax: number;
    platform: number;
    processing: number;
  };
}

export class CryptoRateService {
  static async getRate(params: { 
    amount: number;
    currency: string;
    type: 'buy' | 'sell'
  }): Promise<CryptoRate> {
    try {
      const [cryptoUsdPrice, ngnRate] = await Promise.all([
        this.getCryptoUSDPrice(params.currency),
        getNGNRate()
      ]);

      // Calculate the base rate (NGN per USD)
      const baseRate = ngnRate;
      const spread = 0.005; // 0.5% spread

      // Calculate final rate with spread
      const rate = params.type === 'buy' 
        ? baseRate * (1 + spread)
        : baseRate * (1 - spread);

      return {
        rate,
        fees: {
          quidax: rate * 0.001, // 0.1%
          platform: rate * 0.002, // 0.2%
          processing: rate * 0.001 // 0.1%
        }
      };
    } catch (error) {
      console.error('Rate fetch error:', error);
      throw error;
    }
  }

  public static async getCryptoUSDPrice(currency: string): Promise<number> {
    const response = await fetch(`/api/crypto/prices?currency=${currency}`);

    if (!response.ok) {
      throw new Error('Failed to fetch crypto price');
    }

    const price = await response.json();
    if (price === null) {
      throw new Error(`No price found for ${currency}`);
    }

    return price;
  }

  private static getCoinId(currency: string): string {
    const coinIds: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'USDC': 'usd-coin'
    };
    return coinIds[currency.toUpperCase()] || currency.toLowerCase();
  }
} 