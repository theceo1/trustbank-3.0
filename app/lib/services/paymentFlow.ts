import { TradeDetails } from '@/app/types/trade';
import { PaymentProcessor } from './paymentProcessor';
import { PaymentResult } from '@/app/types/payment';

interface PaymentFlowResult extends PaymentResult {
  redirect?: string;
}

export class PaymentFlow {
  static async handlePayment(trade: TradeDetails): Promise<PaymentFlowResult> {
    switch (trade.payment_method) {
      case 'wallet':
        return await this.handleWalletPayment(trade);
      case 'bank_transfer':
      case 'card':
        return await this.handleExternalPayment(trade);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  private static async handleWalletPayment(trade: TradeDetails): Promise<PaymentFlowResult> {
    const result = await PaymentProcessor.initializePayment(trade);
    return {
      status: result.status,
      reference: result.reference,
      trade_id: result.trade_id
    };
  }

  private static async handleExternalPayment(trade: TradeDetails): Promise<PaymentFlowResult> {
    const result = await PaymentProcessor.initializePayment(trade);
    return {
      status: result.status,
      reference: result.reference,
      trade_id: result.trade_id,
      redirect: result.redirect_url
    };
  }
}