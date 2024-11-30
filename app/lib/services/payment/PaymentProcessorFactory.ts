import { BasePaymentProcessor } from './BasePaymentProcessor';
import { WalletPaymentProcessor } from './WalletPaymentProcessor';
import { BankTransferProcessor } from './BankTransferProcessor';
import { CardPaymentProcessor } from './CardPaymentProcessor';

export class PaymentProcessorFactory {
  static getProcessor(methodType: string): BasePaymentProcessor {
    switch (methodType) {
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
}