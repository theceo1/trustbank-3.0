//app/lib/services/market.ts
import { QuidaxMarketService } from './quidax-market';
import type { MarketRate, MarketRates, QuidaxTicker } from '@/app/lib/types/market';

export class MarketService {
  static async getMarketRate(currency: string): Promise<MarketRate> {
    try {
      const marketPair = `${currency.toLowerCase()}ngn`;
      const ticker = await QuidaxMarketService.getMarketTicker(marketPair);
      
      return {
        buy: ticker.ticker.buy,
        sell: ticker.ticker.sell,
        last: ticker.ticker.last,
        volume: ticker.ticker.volume
      };
    } catch (error) {
      console.error('Market rate fetch error:', error);
      throw error;
    }
  }

  static async getAllMarketRates(): Promise<MarketRates> {
    try {
      const tickers = await QuidaxMarketService.getAllMarketTickers();
      return Object.entries(tickers).reduce((acc, [market, data]) => {
        if (market.endsWith('ngn')) {
          const tickerData = data as QuidaxTicker;
          acc[market] = {
            buy: tickerData.ticker.buy,
            sell: tickerData.ticker.sell,
            last: tickerData.ticker.last,
            volume: tickerData.ticker.volume
          };
        }
        return acc;
      }, {} as MarketRates);
    } catch (error) {
      console.error('Market rates fetch error:', error);
      throw error;
    }
  }
} 