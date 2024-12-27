import { QuidaxService } from './quidax';
import { QuidaxQuotation, QuidaxSwapTransaction } from '@/app/types/quidax';

export class SwapService {
  static async getTemporaryQuotation(params: {
    userId: string;
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
  }) {
    return QuidaxService.makeRequest(`/users/${params.userId}/temporary_swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: params.fromCurrency.toLowerCase(),
        to_currency: params.toCurrency.toLowerCase(),
        from_amount: params.fromAmount
      })
    });
  }

  static async createQuotation(params: {
    userId: string;
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
  }): Promise<QuidaxQuotation> {
    return QuidaxService.makeRequest(`/users/${params.userId}/swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: params.fromCurrency.toLowerCase(),
        to_currency: params.toCurrency.toLowerCase(),
        from_amount: params.fromAmount,
        type: 'instant'
      })
    });
  }

  static async confirmQuotation(params: {
    userId: string;
    quotationId: string;
  }): Promise<QuidaxSwapTransaction> {
    return QuidaxService.makeRequest(
      `/users/${params.userId}/swap_quotation/${params.quotationId}/confirm`,
      { method: 'POST' }
    );
  }

  static async getTransaction(userId: string, transactionId: string) {
    return QuidaxService.makeRequest(
      `/users/${userId}/swap_transactions/${transactionId}`
    );
  }

  static async getAllTransactions(userId: string) {
    return QuidaxService.makeRequest(`/users/${userId}/swap_transactions`);
  }
} 