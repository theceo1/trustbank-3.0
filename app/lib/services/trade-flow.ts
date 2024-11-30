import { UnifiedTradeService } from './unified-trade';
import { QuidaxService } from './quidax';
import { TradeDetails } from '@/app/types/trade';

export class TradeFlow {
  static async createSellOrder(details: TradeDetails) {
    try {
      // 1. Get current rate
      const rate = await QuidaxService.getInstantRate({
        amount: details.amount,
        currency_pair: `${details.currency}_ngn`,
        type: 'sell'
      });

      // 2. Create trade with rate
      const trade = await UnifiedTradeService.createTrade({
        ...details,
        rate: rate.rate,
        total: rate.total,
        fees: rate.fees
      });

      // 3. Return trade with payment details
      return {
        trade,
        payment: {
          amount: trade.total,
          currency: 'NGN',
          payment_method: trade.payment_method,
          reference: trade.quidax_reference
        }
      };
    } catch (error) {
      console.error('Trade flow failed:', error);
      throw error;
    }
  }
}