// app/lib/services/trade-flow.ts
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { QuidaxClient } from './quidax-client';
import { PaymentMethodType } from '@/app/types/payment';

interface TradeRequest {
  amount: number;
  currency: string;
  type: 'buy' | 'sell';
  payment_method: PaymentMethodType;
  user_id: string;
}

export class TradeFlow {
  private static quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');

  static async initializeTrade(details: TradeRequest): Promise<TradeDetails> {
    try {
      // Get quote from Quidax
      const rate = await this.quidaxClient.getRate(
        details.currency.toLowerCase(),
        'ngn'
      );

      if (!rate) throw new Error('Failed to get rate');

      const total = details.amount * Number(rate);
      const fee = total * 0.01; // 1% fee

      // Calculate fees and total
      const trade: TradeDetails = {
        user_id: details.user_id,
        type: details.type,
        currency: details.currency,
        amount: details.amount,
        rate: Number(rate),
        total: total + fee,
        fees: {
          platform: fee * 0.8, // 80% of fee is platform fee
          processing: fee * 0.2, // 20% of fee is processing fee
          total: fee
        },
        payment_method: details.payment_method,
        status: TradeStatus.PENDING,
        reference: `TRADE_${Date.now()}_${Math.random().toString(36).substring(7)}`
      };

      return trade;
    } catch (error) {
      console.error('Error initializing trade:', error);
      throw error;
    }
  }
}