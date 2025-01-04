//app/lib/services/quidax-swap.ts
import { PaymentStatus } from '../../types/payment';
import { QuidaxQuotation, QuidaxSwapTransaction, QuidaxTemporaryQuotation } from '../../types/quidax';

export class QuidaxSwapService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async createSwapQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<{ data: QuidaxQuotation }> {
    console.log('[QuidaxSwap] Creating swap quotation with params:', {
      ...params,
      user_id: params.user_id === 'me' ? 'me' : '***'
    });

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
        console.error('[QuidaxSwap] Failed to create quotation:', error);
        throw new Error(error.message || 'Failed to create swap quotation');
      }

      const result = await response.json();
      console.log('[QuidaxSwap] Successfully created quotation:', result);
      return result;
    } catch (error) {
      console.error('[QuidaxSwap] Create swap quotation error:', error);
      throw error;
    }
  }

  static async confirmSwap(userId: string, quotationId: string): Promise<{ data: QuidaxSwapTransaction }> {
    console.log('[QuidaxSwap] Confirming swap:', { userId: userId === 'me' ? 'me' : '***', quotationId });
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
        console.error('[QuidaxSwap] Failed to confirm swap:', error);
        throw new Error(error.message || 'Failed to confirm swap');
      }

      const result = await response.json();
      console.log('[QuidaxSwap] Successfully confirmed swap:', result);
      return result;
    } catch (error) {
      console.error('[QuidaxSwap] Confirm swap error:', error);
      throw error;
    }
  }

  static async getSwapTransaction(userId: string, transactionId: string): Promise<{ data: QuidaxSwapTransaction }> {
    console.log('[QuidaxSwap] Getting swap transaction:', { userId: userId === 'me' ? 'me' : '***', transactionId });
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
        console.error('[QuidaxSwap] Failed to fetch transaction:', error);
        throw new Error(error.message || 'Failed to fetch swap transaction');
      }

      const result = await response.json();
      console.log('[QuidaxSwap] Successfully fetched transaction:', result);
      return result;
    } catch (error) {
      console.error('[QuidaxSwap] Get swap transaction error:', error);
      throw error;
    }
  }

  static async getTemporaryQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<{ data: QuidaxTemporaryQuotation }> {
    console.log('[QuidaxSwap] Getting temporary quotation:', {
      ...params,
      user_id: params.user_id === 'me' ? 'me' : '***'
    });
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
        console.error('[QuidaxSwap] Failed to get temporary quotation:', error);
        throw new Error(error.message || 'Failed to get temporary quotation');
      }

      const result = await response.json();
      console.log('[QuidaxSwap] Successfully got temporary quotation:', result);
      return result;
    } catch (error) {
      console.error('[QuidaxSwap] Temporary quotation error:', error);
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