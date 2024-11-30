import { BasePaymentProcessor, PaymentProcessorResult, PaymentInitDetails } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';
import { QuidaxService } from '../quidax';

export class BankTransferProcessor extends BasePaymentProcessor {
  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    try {
      const quidaxResult = await QuidaxService.processPayment({
        ...trade,
        payment_method: 'bank_transfer'
      });
 
      return {
        success: true,
        reference: quidaxResult.reference,
        status: 'pending',
        redirect_url: quidaxResult.payment_url,
        metadata: {
          bank_details: quidaxResult.bank_details,
          expires_at: quidaxResult.expires_at
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
        payment_proof: paymentDetails.payment_proof,
        bank_reference: paymentDetails.bank_reference
      }
    };
  }

  async validatePayment(details: TradeDetails): Promise<void> {
    // Bank transfer doesn't need pre-validation
    return Promise.resolve();
  }

  async initializePayment(details: PaymentInitDetails): Promise<PaymentProcessorResult> {
    const bankDetails = await QuidaxService.getBankDetails();
    return {
      success: true,
      reference: details.quidax_reference,
      status: 'pending',
      metadata: {
        bank_name: bankDetails.bank_name,
        account_number: bankDetails.account_number,
        account_name: 'TrustBank Limited',
        amount: details.amount
      }
    };
  }
}