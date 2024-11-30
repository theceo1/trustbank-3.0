import { TradeDetails } from '@/app/types/trade';
import { PaymentMethodType } from '@/app/types/payment';
import { PaymentProcessor } from '@/app/lib/services/paymentProcessor';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';

export class PaymentFlowController {
  static async initiate(tradeDetails: TradeDetails) {
    // Map fees to expected structure
    const mappedFees = {
      service: tradeDetails.fees.platform + tradeDetails.fees.quidax,
      network: tradeDetails.fees.processing
    };

    // Validate trade status and details
    await UnifiedTradeService.validateTradeParams({
      amount: tradeDetails.amount,
      type: tradeDetails.type,
      currency: tradeDetails.currency,
      user_id: tradeDetails.user_id,
      rate: tradeDetails.rate,
      total: tradeDetails.total,
      fees: mappedFees,
      paymentMethod: tradeDetails.payment_method as PaymentMethodType,
      reference: tradeDetails.reference
    });

    // Initialize payment based on method
    const paymentResult = await PaymentProcessor.initializePayment(tradeDetails);

    // Return appropriate response based on payment method
    return this.handlePaymentResponse(tradeDetails.payment_method as PaymentMethodType, paymentResult);
  }

  private static handlePaymentResponse(
    method: PaymentMethodType, 
    response: any
  ) {
    switch (method) {
      case 'wallet':
        return {
          type: 'internal',
          redirect: `/payment/${response.trade_id}`
        };
      case 'bank_transfer':
      case 'card':
        return {
          type: 'external',
          redirect: response.payment_url
        };
      default:
        throw new Error('Unsupported payment method');
    }
  }
}