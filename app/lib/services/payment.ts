import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { PaymentMethod, PaymentMethodType, PaymentStatus } from '@/app/types/payment';
import { TradeDetails } from '@/app/types/trade';
import { WalletPaymentProcessor } from './payment/WalletPaymentProcessor';
import { BankTransferProcessor } from './payment/BankTransferProcessor';
import { CardPaymentProcessor } from './payment/CardPaymentProcessor';

export class PaymentService {
  private static supabase = createClientComponentClient<Database>();

  static async getPaymentMethod(methodType: PaymentMethodType): Promise<PaymentMethod> {
    const { data, error } = await this.supabase
      .from('payment_methods')
      .select('*')
      .eq('type', methodType)
      .single();

    if (error) throw error;
    return data;
  }

  static calculateFees(amount: number, method: PaymentMethod): number {
    const baseFee = amount * 0.01; // 1% base fee
    const methodFee = amount * this.getMethodFeeRate(method.type);
    return baseFee + methodFee;
  }

  private static getMethodFeeRate(methodType: PaymentMethodType): number {
    const feeRates = {
      wallet: 0.005, // 0.5%
      bank: 0.015,   // 1.5%
      card: 0.025    // 2.5%
    };
    return feeRates[methodType as keyof typeof feeRates] || 0;
  }

  static async processPayment(trade: TradeDetails) {
    try {
      const paymentProcessor = await this.getPaymentProcessor(trade.payment_method as PaymentMethodType);
      return await paymentProcessor.process(trade);
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  static async getPaymentProcessor(method: PaymentMethodType) {
    switch (method) {
      case 'wallet':
        return new WalletPaymentProcessor();
      case 'bank_transfer':
        return new BankTransferProcessor();
      case 'card':
        return new CardPaymentProcessor();
      default:
        throw new Error('Unsupported payment method');
    }
  }

  static async getPaymentStatus(tradeId: string): Promise<PaymentStatus> {
    try {
      const { data, error } = await this.supabase
        .from('trades')
        .select('payment_status')
        .eq('id', tradeId)
        .single();

      if (error) throw error;
      return data.payment_status as PaymentStatus;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }
}