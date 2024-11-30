import { BasePaymentProcessor, PaymentProcessorResult, PaymentInitDetails } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { QuidaxService } from '../quidax';

export class CardPaymentProcessor extends BasePaymentProcessor {
  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    try {
      const quidaxResult = await QuidaxService.processPayment({
        ...trade,
        payment_method: 'card'
      });

      return {
        success: true,
        reference: quidaxResult.reference,
        status: 'pending',
        redirect_url: quidaxResult.payment_url,
        metadata: {
          provider: quidaxResult.provider,
          session_id: quidaxResult.session_id
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentProcessorResult> {
    const paymentDetails = await QuidaxService.getPaymentDetails(reference);
    return {
      success: paymentDetails.status === 'completed',
      status: QuidaxService.mapQuidaxStatus(paymentDetails.status),
      reference,
      metadata: {
        card_reference: paymentDetails.card_reference,
        authorization: paymentDetails.authorization
      }
    };
  }

  async validatePayment(details: TradeDetails): Promise<void> {
    return Promise.resolve();
  }

  async initializePayment(details: PaymentInitDetails): Promise<PaymentProcessorResult> {
    const quidaxResult = await QuidaxService.processPayment({
      user_id: details.user_id,
      type: 'buy',
      currency: details.currency,
      amount: details.amount,
      rate: 1,
      total: details.amount,
      fees: {
        quidax: 0,
        platform: 0,
        processing: 0
      },
      payment_method: 'card',
      status: 'pending',
      quidax_reference: details.quidax_reference
    });

    return {
      success: true,
      reference: quidaxResult.reference,
      status: 'pending',
      redirect_url: quidaxResult.payment_url,
      metadata: {
        provider: quidaxResult.provider,
        session_id: quidaxResult.session_id
      }
    };
  }
}