import { QUIDAX_CONFIG } from '../config/quidax';

interface BankTransferResponse {
  account_number: string;
  account_name: string;
  bank_name: string;
  reference: string;
}

export class QuidaxBankService {
  private static baseUrl = QUIDAX_CONFIG.apiUrl;
  private static apiKey = QUIDAX_CONFIG.apiKey;

  static async initializeBankTransfer(params: {
    amount: number;
    currency: string;
    reference: string;
  }): Promise<BankTransferResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/bank_transfers/initialize`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(params)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize bank transfer');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Initialize bank transfer error:', error);
      throw error;
    }
  }
} 