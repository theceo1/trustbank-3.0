// app/lib/services/trade-flow.ts
import { UnifiedTradeService } from './unifiedTrade';
import { QuidaxService } from './quidax';
import { QuidaxMarketService } from './quidax-market';
import { TradeDetails, TradeParams } from '@/app/types/trade';

export class TradeFlow {
  static async createSellOrder(details: TradeDetails) {
    try {
      // 1. Get market rate first
      const quote = await QuidaxMarketService.getQuote({
        market: `${details.currency.toLowerCase()}ngn`,
        unit: details.currency.toLowerCase(),
        kind: 'ask',
        volume: details.amount.toString()
      });

      // 2. Get swap quotation
      const quotation = await QuidaxService.createSwapQuotation({
        user_id: details.user_id,
        from_currency: details.currency,
        to_currency: 'ngn',
        from_amount: details.amount.toString()
      });

      // 3. Create trade with quotation details
      const tradeParams: TradeParams = {
        user_id: details.user_id,
        type: details.type,
        currency: details.currency,
        amount: details.amount,
        rate: Number(quote.price.amount) / details.amount,
        total: Number(quote.total.amount),
        fees: {
          service: Number(quote.fee.amount) * 0.8, // 80% of fee is service fee
          network: Number(quote.fee.amount) * 0.2  // 20% of fee is network fee
        },
        paymentMethod: details.payment_method,
        reference: quotation.id
      };

      const trade = await UnifiedTradeService.createTrade(tradeParams);

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