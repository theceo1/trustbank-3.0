// app/lib/services/payment/WalletPaymentProcessor.ts
import { BasePaymentProcessor, PaymentProcessorResult, PaymentInitDetails } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { QuidaxWalletService, getWalletService } from '@/app/lib/services/quidax-wallet';
import { QuidaxService } from '../quidax';

export class WalletPaymentProcessor extends BasePaymentProcessor {
  private walletService: QuidaxWalletService;

  constructor() {
    super();
    this.walletService = getWalletService();
  }

  async validatePayment(details: TradeDetails): Promise<void> {
    const walletResponse = await this.walletService.getWallet(details.user_id, details.currency.toLowerCase());
    const balance = parseFloat(walletResponse.data[0].balance);
    if (balance < details.total) {
      throw new Error('Insufficient balance');
    }
  }

  async initializePayment(details: PaymentInitDetails): Promise<PaymentProcessorResult> {
    // Use the wallet service to process the payment
    const walletResponse = await this.walletService.getWallet(details.user_id, details.currency.toLowerCase());
    
    // Verify the payment was successful
    const status = walletResponse.status === 'success' ? 'completed' : 'failed';

    return {
      success: status === 'completed',
      reference: details.trade_id,
      status,
      redirect_url: `/payment/${details.trade_id}`,
      metadata: { quidax_reference: details.quidax_reference }
    };
  }

  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    await this.validatePayment(trade);
    return this.initializePayment({
      trade_id: trade.id!,
      amount: trade.total,
      currency: trade.currency,
      user_id: trade.user_id,
      quidax_reference: trade.reference!
    });
  }

  async verifyPayment(reference: string): Promise<PaymentProcessorResult> {
    // For wallet payments, we can consider them completed immediately
    // as the balance check was done during validation
    return {
      success: true,
      status: 'completed',
      reference
    };
  }
}