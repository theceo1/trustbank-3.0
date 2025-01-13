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

    if (!this.apiKey) {
      throw new Error('Quidax API key not configured');
    }

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

      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[QuidaxSwap] Failed to parse response:', {
          status: response.status,
          statusText: response.statusText,
          responseText,
          parseError
        });
        throw new Error(`Invalid response from Quidax API: ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('[QuidaxSwap] Failed to create quotation:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
          endpoint: `/users/${params.user_id}/swap_quotation`
        });
        throw new Error(responseData.message || `Failed to create swap quotation: ${response.statusText}`);
      }

      console.log('[QuidaxSwap] Successfully created quotation:', responseData);
      return responseData;
    } catch (error) {
      console.error('[QuidaxSwap] Create swap quotation error:', error);
      throw error;
    }
  }

  static async confirmSwap(userId: string, quotationId: string): Promise<{ data: QuidaxSwapTransaction; error?: { message: string; status: number } }> {
    console.log('[QuidaxSwap] Confirming swap:', { userId: userId === 'me' ? 'me' : '***', quotationId });
    
    if (!this.apiKey) {
      return {
        data: null as any,
        error: {
          message: 'Quidax API key not configured',
          status: 500
        }
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/swap_quotation/${quotationId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[QuidaxSwap] Failed to parse response:', {
          status: response.status,
          statusText: response.statusText,
          responseText,
          parseError
        });
        return {
          data: null as any,
          error: {
            message: `Invalid response from Quidax API: ${response.statusText}`,
            status: 500
          }
        };
      }

      if (!response.ok) {
        console.error('[QuidaxSwap] Failed to confirm swap:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
          endpoint: `/users/${userId}/swap_quotation/${quotationId}/confirm`
        });
        return {
          data: null as any,
          error: {
            message: responseData.message || `Failed to confirm swap: ${response.statusText}`,
            status: response.status
          }
        };
      }

      console.log('[QuidaxSwap] Successfully confirmed swap:', responseData);
      return { data: responseData.data };
    } catch (error: any) {
      console.error('[QuidaxSwap] Confirm swap error:', error);
      return {
        data: null as any,
        error: {
          message: error.message || 'Failed to confirm swap',
          status: 500
        }
      };
    }
  }

  static async getSwapTransaction(userId: string, transactionId: string): Promise<{ data: QuidaxSwapTransaction }> {
    console.log('[QuidaxSwap] Getting swap transaction:', { userId: userId === 'me' ? 'me' : '***', transactionId });
    
    if (!this.apiKey) {
      throw new Error('Quidax API key not configured');
    }

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
        console.error('[QuidaxSwap] Failed to fetch transaction:', {
          status: response.status,
          statusText: response.statusText,
          error,
          endpoint: `/users/${userId}/swap_transactions/${transactionId}`
        });
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
  }): Promise<{ data: QuidaxQuotation }> {
    console.log('[QuidaxSwap] Getting temporary quotation with params:', {
      ...params,
      user_id: params.user_id === 'me' ? 'me' : '***'
    });

    if (!this.apiKey) {
      throw new Error('Quidax API key not configured');
    }

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
            from_currency: params.from_currency.toUpperCase(),
            to_currency: params.to_currency.toUpperCase(),
            from_amount: params.from_amount
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('[QuidaxSwap] Failed to get temporary quotation:', {
          status: response.status,
          statusText: response.statusText,
          error,
          endpoint: `/users/${params.user_id}/temporary_swap_quotation`
        });
        throw new Error(error.message || 'Failed to get temporary swap quotation');
      }

      const result = await response.json();
      console.log('[QuidaxSwap] Successfully got temporary quotation:', result);
      return result;
    } catch (error) {
      console.error('[QuidaxSwap] Get temporary quotation error:', error);
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