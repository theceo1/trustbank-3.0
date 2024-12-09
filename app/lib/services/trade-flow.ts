// app/lib/services/trade-flow.ts
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

      // 2. Create trade with rate and convert string amounts to numbers
      const trade = await UnifiedTradeService.createTrade({
        ...details,
        rate: Number(rate.rate),
        total: Number(rate.total),
        fees: {
          platform: Number(rate.fees.platform),
          processing: Number(rate.fees.processing),
          total: Number(rate.fees.quidax) + Number(rate.fees.platform) + Number(rate.fees.processing)
        }
      });

      // 3. Return trade with payment details
      return {
        trade,
        payment: {
          amount: trade.total,
          currency: 'NGN',
          payment_method: trade.payment_method,
          reference: trade.id
        }
      };
    } catch (error) {
      console.error('Trade flow failed:', error);
      throw error;
    }
  }
}