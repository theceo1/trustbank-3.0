import { TradeDetails } from '@/app/types/trade';
import { PaymentProcessor } from './paymentProcessor';
import { WalletService } from './wallet';

export class PaymentFlow {
  static async handlePayment(trade: TradeDetails) {
    switch (trade.payment_method) {
      case 'wallet':
        return this.handleWalletPayment(trade);
      case 'bank_transfer':
      case 'card':
        return this.handleExternalPayment(trade);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  private static async handleWalletPayment(trade: TradeDetails) {
    const balance = await WalletService.getUserBalance(trade.user_id);
    if (balance < trade.total) {
      throw new Error('Insufficient wallet balance');
    }

    await PaymentProcessor.initializePayment(trade);
    return { redirect: `/payment/${trade.id}` };
  }

  private static async handleExternalPayment(trade: TradeDetails) {
    const { payment_url } = await PaymentProcessor.initializePayment(trade);
    return { redirect: payment_url };
  }
}