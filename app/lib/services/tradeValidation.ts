import { TradeParams } from '@/app/types/trade';
import { z } from 'zod';
import { tradeLimiter } from './rateLimit';

const TradeSchema = z.object({
  amount: z.number()
    .positive()
    .min(0.0001, 'Minimum trade amount is 0.0001')
    .max(100000, 'Maximum trade amount is 100,000'),
  
  currency: z.enum(['btc', 'eth', 'usdt', 'usdc']),
  
  type: z.enum(['buy', 'sell']),
  
  paymentMethod: z.enum(['bank', 'wallet', 'card']),
  
  rate: z.number().positive()
});

export class TradeValidation {
  static async validateTrade(params: TradeParams): Promise<boolean> {
    try {
      // Validate schema
      TradeSchema.parse(params);

      // Check trading hours (9 AM - 11 PM)
      const hour = new Date().getHours();
      if (hour < 9 || hour >= 23) {
        throw new Error('Trading is only available between 9 AM and 11 PM');
      }

      // Check user's trading limits
      const withinLimits = await tradeLimiter.increment(params.user_id);
      if (!withinLimits) {
        throw new Error('Trading limit exceeded. Please try again in an hour.');
      }

      // Rate validation is handled by the trade service
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.errors[0].message);
      }
      throw error;
    }
  }

  static validatePaymentMethod(method: string, amount: number): boolean {
    const limits = {
      bank: { min: 1000, max: 10000000 },
      card: { min: 100, max: 1000000 },
      wallet: { min: 10, max: 5000000 }
    };

    const limit = limits[method as keyof typeof limits];
    if (!limit) throw new Error('Invalid payment method');

    return amount >= limit.min && amount <= limit.max;
  }
}