import { PaymentMethodType } from '@/app/types/payment';
import { TradeDetails } from '@/app/types/trade';

export class ValidationService {
  static validatePaymentMethod(method: PaymentMethodType): boolean {
    return ['wallet', 'bank_transfer', 'card'].includes(method);
  }

  static validateTradeDetails(trade: TradeDetails): boolean {
    return !!(trade.amount && trade.currency && trade.payment_method);
  }
}