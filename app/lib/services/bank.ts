// app/lib/services/bank.ts
import { TradeDetails } from '@/app/types/trade';

export class BankService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async generateTransferDetails(trade: TradeDetails) {
    const response = await fetch(
      `${this.baseUrl}/bank_transfers/initialize`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
      accountNumber: bankTransfer.account_number,
      accountName: bankTransfer.account_name,
      bankName: bankTransfer.bank_name,
      reference: bankTransfer.reference
    };
  }
}