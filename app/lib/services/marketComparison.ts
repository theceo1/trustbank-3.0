import { CryptoRateService } from '@/app/lib/services/cryptoRates';

export interface ExchangeRate {
  exchange: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  fees: {
    trading: number;
    withdrawal: number;
  };
}

export class MarketComparisonService {
  static async getCompetitorRates(currency: string): Promise<ExchangeRate[]> {
    try {
      const [buyRate, sellRate] = await Promise.all([
        CryptoRateService.getRate({
          amount: 1,
          currency: currency,
          type: 'buy'
        }),
        CryptoRateService.getRate({
          amount: 1,
          currency: currency,
          type: 'sell'
        })
      ]);

      const baseSpread = 0.005; // 0.5% base spread

      // TrustBank rates (best rates)
      const trustBankRate = {
        exchange: 'trustBank',
        buyRate: buyRate.rate,
        sellRate: sellRate.rate,
        spread: baseSpread * 100,
        fees: {
          trading: 0.1,
          withdrawal: 0.1
        }
      };

      // Competitors with slightly worse rates
      const competitors = [
        { 
          exchange: 'Competitor 1',
          buyRate: buyRate.rate * 1.015,
          sellRate: sellRate.rate * 0.985,
          spread: (baseSpread + 0.015) * 100,
          fees: {
            trading: 0.15,
            withdrawal: 0.2
          }
        },
        {
          exchange: 'Competitor 2',
          buyRate: buyRate.rate * 1.02,
          sellRate: sellRate.rate * 0.98,
          spread: (baseSpread + 0.02) * 100,
          fees: {
            trading: 0.2,
            withdrawal: 0.25
          }
        }
      ];

      return [trustBankRate, ...competitors];
    } catch (error) {
      console.error('Error fetching rates:', error);
      return [];
    }
  }
}