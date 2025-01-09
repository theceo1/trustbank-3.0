// app/lib/services/payment/BankTransferProcessor.ts
import { BasePaymentProcessor, PaymentProcessorResult, PaymentInitDetails } from './BasePaymentProcessor';
import { TradeDetails } from '@/app/types/trade';

export class BankTransferProcessor extends BasePaymentProcessor {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  async process(trade: TradeDetails): Promise<PaymentProcessorResult> {
    try {
      const response = await fetch(
        `${BankTransferProcessor.baseUrl}/bank_transfers/initialize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BankTransferProcessor.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            amount: trade.amount,
            currency: trade.currency,
            reference: trade.reference!
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize bank transfer');
      }

      const data = await response.json();
      const bankTransfer = data.data;
 
      return {
        success: true,
        reference: bankTransfer.reference,
        status: 'pending',
        metadata: {
          bank_details: {
            bank_name: bankTransfer.bank_name,
            account_number: bankTransfer.account_number,
            account_name: bankTransfer.account_name
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentProcessorResult> {
    // TODO: Implement payment verification
    return {
      success: false,
      status: 'pending',
      reference,
      metadata: {}
    };
  }

  async validatePayment(details: TradeDetails): Promise<void> {
    // Bank transfer doesn't need pre-validation
    return Promise.resolve();
  }

  async initializePayment(details: PaymentInitDetails): Promise<PaymentProcessorResult> {
    const response = await fetch(
      `${BankTransferProcessor.baseUrl}/bank_transfers/initialize`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BankTransferProcessor.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: details.amount,
          currency: details.currency,
          reference: details.quidax_reference
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize bank transfer');
    }

    const data = await response.json();
    const bankTransfer = data.data;

    return {
      success: true,
      reference: details.quidax_reference,
      status: 'pending',
      metadata: {
        bank_name: bankTransfer.bank_name,
        account_number: bankTransfer.account_number,
        account_name: bankTransfer.account_name,
        amount: details.amount
      }
    };
  }
}