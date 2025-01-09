import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { PaymentService } from './payment';
import { WalletService } from '@/app/lib/services/wallet';
import { PaymentMethodType, PaymentResult, PaymentStatus } from '@/app/types/payment';
import { PaymentProcessorFactory } from './payment/PaymentProcessorFactory';

export class PaymentProcessor {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async initializePayment(trade: TradeDetails): Promise<PaymentResult> {
    if (trade.status !== TradeStatus.PENDING) {
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

  private static async processWalletPayment(trade: TradeDetails): Promise<PaymentResult> {
    const balance = await WalletService.getUserBalance(trade.user_id);
    if (balance < trade.total) {
      throw new Error('Insufficient wallet balance');
    }

    if (!trade.reference) {
      throw new Error('Missing Quidax reference');
    }

    await WalletService.updateBalance(trade.user_id, -trade.total);
    
    // Process the wallet payment directly
    const response = await fetch(`${this.baseUrl}/wallet/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference: trade.reference,
        amount: trade.total.toString(),
        currency: trade.currency
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process wallet payment');
    }

    const data = await response.json();
    return {
      status: data.status as PaymentStatus,
      reference: trade.reference,
      trade_id: trade.id!
    };
  }

  private static async processExternalPayment(trade: TradeDetails): Promise<PaymentResult> {
    if (!trade.reference) {
      throw new Error('Missing Quidax reference');
    }

    const processor = PaymentProcessorFactory.getProcessor(trade.payment_method as PaymentMethodType);
    const result = await processor.process(trade);
    
    return {
      ...result,
      status: result.status as PaymentStatus,
      trade_id: trade.id!
    };
  }
}