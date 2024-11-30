import { BasePaymentProcessor, PaymentProcessorResult, PaymentInitDetails } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { WalletService } from '../wallet';
import { QuidaxService } from '../quidax';

export class WalletPaymentProcessor extends BasePaymentProcessor {
  async validatePayment(details: TradeDetails): Promise<void> {
    const balance = await WalletService.getUserBalance(details.user_id);
    if (balance < details.total) {
      throw new Error('Insufficient balance');
    }
  }

  async initializePayment(details: PaymentInitDetails): Promise<PaymentProcessorResult> {
    await WalletService.transferToExchange(details.user_id, details.amount);
    const quidaxResult = await QuidaxService.processWalletPayment(details.quidax_reference);

    return {
      success: true,
      reference: details.trade_id,
      status: 'pending',
      redirect_url: `/payment/${details.trade_id}`,
      metadata: { quidax_reference: quidaxResult.reference }
    };
  }

  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    await this.validatePayment(trade);
    return this.initializePayment({
      trade_id: trade.id!,
      amount: trade.total,
      currency: trade.currency,
      user_id: trade.user_id,
      quidax_reference: trade.quidax_reference!
    });
  }

  async verifyPayment(reference: string): Promise<PaymentProcessorResult> {
    const quidaxStatus = await QuidaxService.getTradeStatus(reference);
    return {
      success: quidaxStatus === 'completed',
      status: QuidaxService.mapQuidaxStatus(quidaxStatus),
      reference
    };
  }
}