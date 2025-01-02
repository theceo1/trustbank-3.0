//app/lib/services/quidax-swap.ts
import { PaymentStatus } from '@/app/types/payment';
import { QuidaxQuotation, QuidaxSwapTransaction, QuidaxTemporaryQuotation } from '@/app/types/quidax';

export class QuidaxSwapService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async createSwapQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<{ data: QuidaxQuotation }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${params.user_id}/swap_quotation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            from_currency: params.from_currency.toLowerCase(),
            to_currency: params.to_currency.toLowerCase(),
            from_amount: params.from_amount
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create swap quotation');
      }

      return response.json();
    } catch (error) {
      console.error('Create swap quotation error:', error);
      throw error;
    }
  }

  static async confirmSwap(userId: string, quotationId: string): Promise<{ data: QuidaxSwapTransaction }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/swap_quotation/${quotationId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm swap');
      }

      return response.json();
    } catch (error) {
      console.error('Confirm swap error:', error);
      throw error;
    }
  }

  static async getSwapTransaction(userId: string, transactionId: string): Promise<{ data: QuidaxSwapTransaction }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/swap_transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch swap transaction');
      }

      return response.json();
    } catch (error) {
      console.error('Get swap transaction error:', error);
      throw error;
    }
  }

  static async getTemporaryQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<{ data: QuidaxTemporaryQuotation }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${params.user_id}/temporary_swap_quotation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            from_currency: params.from_currency.toLowerCase(),
            to_currency: params.to_currency.toLowerCase(),
            from_amount: params.from_amount
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get temporary quotation');
      }

      return response.json();
    } catch (error) {
      console.error('Temporary quotation error:', error);
      throw error;
    }
  }

  static mapQuidaxStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'failed'
    };
    return statusMap[status] || 'failed';
  }
} 