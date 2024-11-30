import { TradeDetails } from '@/app/types/trade';
import { PaymentService } from './payment';
import { QuidaxService } from './quidax';
import { WalletService } from './wallet';
import { PaymentMethodType } from '@/app/types/payment';
import { PaymentProcessorFactory } from './payment/PaymentProcessorFactory';

export class PaymentProcessor {
  static async initializePayment(trade: TradeDetails) {
    if (trade.status !== 'pending') {
      throw new Error('Invalid trade status');
    }

    const method = await PaymentService.getPaymentMethod(trade.payment_method as PaymentMethodType);
    const fees = PaymentService.calculateFees(trade.amount, method);

    switch (trade.payment_method) {
      case 'wallet':
        return await this.processWalletPayment(trade);
      case 'bank_transfer':
      case 'card':
        return await this.processExternalPayment(trade);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  private static async processWalletPayment(trade: TradeDetails) {
    const balance = await WalletService.getUserBalance(trade.user_id);
    if (balance < trade.total) {
      throw new Error('Insufficient wallet balance');
    }

    if (!trade.quidax_reference) {
      throw new Error('Missing Quidax reference');
    }

    await WalletService.updateBalance(trade.user_id, -trade.total);
    return QuidaxService.processWalletPayment(trade.quidax_reference);
  }

  private static async processExternalPayment(trade: TradeDetails) {
    if (!trade.quidax_reference) {
      throw new Error('Missing Quidax reference');
    }

    const paymentDetails = await QuidaxService.getPaymentDetails(trade.quidax_reference);
    return {
      payment_url: paymentDetails.payment_url,
      reference: paymentDetails.reference
    };
    const processor = PaymentProcessorFactory.getProcessor(trade.payment_method as PaymentMethodType);
    return processor.process(trade);
  }
}