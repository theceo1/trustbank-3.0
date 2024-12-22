// app/lib/services/quidax.ts
import { TradeParams, TradeDetails, TradeStatus } from '@/app/types/trade';
import { createHmac } from 'crypto';
import crypto from 'crypto';
import { MarketStats } from '../../types/market';
import axios from 'axios';
import { 
  QuidaxQuotation,
  QuidaxSwapTransaction,
  QuidaxTemporaryQuotation,
  QuidaxQuotationParams,
  QuidaxWallet,
  QuidaxMarketData,
  QuidaxRateResponse
} from '../../types/quidax';
import { PaymentStatus } from '@/app/types/payment';

export class QuidaxError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'QuidaxError';
  }
}

export class QuidaxService {
  private static baseUrl = process.env.QUIDAX_API_URL;
  private static secretKey = process.env.QUIDAX_SECRET_KEY!;
  private static BASE_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
  private static API_KEY = process.env.QUIDAX_API_KEY;

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.baseUrl || !this.secretKey) {
      throw new QuidaxError('API configuration missing', 'CONFIG_ERROR');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      if (!response.ok) {
        throw new QuidaxError(
          response.statusText,
          'REQUEST_FAILED',
          response.status
        );
      }
      const result = await response.json();
      return result.data as T;
    } catch (error) {
      console.error('Quidax API request failed:', error);
      throw error;
    }
  }

  static async getTemporaryQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<QuidaxTemporaryQuotation> {
    return this.makeRequest(`/users/${params.user_id}/temporary_swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: params.from_currency.toLowerCase(),
        to_currency: params.to_currency.toLowerCase(),
        from_amount: params.from_amount
      })
    });
  }

  static async createSwapQuotation(params: QuidaxQuotationParams): Promise<QuidaxQuotation> {
    return this.makeRequest(`/users/${params.user_id}/swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: params.from_currency.toLowerCase(),
        to_currency: params.to_currency.toLowerCase(),
        from_amount: params.from_amount
      })
    });
  }

  static async confirmSwapQuotation(params: {
    user_id: string;
    quotation_id: string;
  }): Promise<QuidaxSwapTransaction> {
    return this.makeRequest(
      `/users/${params.user_id}/swap_quotation/${params.quotation_id}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({
          confirm: true
        })
      }
    );
  }

  static async getSwapTransaction(
    userId: string,
    transactionId: string
  ): Promise<QuidaxSwapTransaction> {
    return this.makeRequest(`/users/${userId}/swap_transactions/${transactionId}`);
  }

  static async getWalletInfo(
    userId: string, 
    currency: string
  ): Promise<QuidaxWallet> {
    return this.makeRequest(`/users/${userId}/wallets/${currency.toLowerCase()}`);
  }

  static async getRate(params: {
    amount: number;
    currency_pair: string;
    type: 'buy' | 'sell';
  }): Promise<{
    price: {
      amount: string;
      currency: string;
    };
    total: {
      amount: string;
      currency: string;
    };
    fees: {
      platform: string;
      processing: string;
      quidax: string;
    };
  }> {
    return this.makeRequest('/instant-orders/quote', {
      method: 'POST',
      body: JSON.stringify({
        amount: params.amount.toString(),
        currency_pair: params.currency_pair.toLowerCase(),
        type: params.type
      })
    });
  }

  static async getMarketStats(pair: string): Promise<MarketStats> {
    const data = await this.makeRequest<QuidaxMarketData>(`/markets/${pair}/stats`);
    return {
      market: {
        id: pair,
        name: data.market_name || pair,
        base_unit: data.base_unit || pair.split('_')[0],
        quote_unit: data.quote_unit || pair.split('_')[1]
      },
      ticker: {
        last: data.last_price?.toString() || '0',
        high: data.high_24h?.toString() || '0',
        low: data.low_24h?.toString() || '0',
        vol: data.volume_24h?.toString() || '0',
        change: data.price_change_24h?.toString() || '0'
      }
    };
  }

  static verifyWebhookSignature(payload: any, signature?: string | null): boolean {
    if (!signature || !this.secretKey) return false;
    
    const computedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }

  static async getTradeStatus(reference: string): Promise<string> {
    try {
      const defaultHeaders = {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const response = await fetch(`${this.baseUrl}/trades/${reference}`, {
        headers: defaultHeaders
      });
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error getting trade status:', error);
      throw error;
    }
  }

  static mapQuidaxStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'failed',
      'initiated': 'initiated',
      'confirming': 'confirming'
    };
    return statusMap[status] || 'pending';
  }

  static async getOrCreateSubAccount(params: {
    email: string;
    first_name: string;
    last_name: string;
  }) {
    try {
      // Check if the sub-account already exists
      const searchResponse = await axios.get(
        `${this.baseUrl}/users?email=${encodeURIComponent(params.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (searchResponse.data.data.length > 0) {
        return searchResponse.data.data[0];
      }

      // Create a new sub-account if it doesn't exist
      const response = await axios.post(
        `${this.baseUrl}/users`,
        {
          identity: {
            email: params.email,
            first_name: params.first_name,
            last_name: params.last_name
          },
          type: 'sub_account'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Get or create sub-account error:', error.response?.data || error);
      throw error;
    }
  }

  static async initializeBankTransfer(params: {
    amount: number;
    currency: string;
    reference: string;
  }) {
    try {
      const response = await axios.post(
        `${process.env.QUIDAX_API_URL}/bank-transfers/initialize`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new QuidaxError(
          response.data.message || 'Failed to initialize bank transfer',
          'BANK_TRANSFER_INIT_FAILED',
          response.status
        );
      }

      return {
        account_number: response.data.account_number,
        account_name: response.data.account_name,
        bank_name: response.data.bank_name,
        reference: response.data.reference
      };
    } catch (error) {
      console.error('Bank transfer initialization error:', error);
      throw error;
    }
  }

  static async processPayment(params: TradeDetails & { payment_method: string }) {
    try {
      const response = await axios.post(
        `${process.env.QUIDAX_API_URL}/payments/process`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new QuidaxError(
          response.data.message || 'Payment processing failed',
          'PAYMENT_PROCESS_FAILED',
          response.status
        );
      }

      return response.data;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  static async getPaymentDetails(reference: string) {
    try {
      const response = await axios.get(
        `${process.env.QUIDAX_API_URL}/payments/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw error;
    }
  }

  static async getBankDetails() {
    try {
      const response = await axios.get(
        `${process.env.QUIDAX_API_URL}/bank-details`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Bank details fetch error:', error);
      throw error;
    }
  }

  static async processWalletPayment(reference: string) {
    try {
      const response = await axios.post(
        `${process.env.QUIDAX_API_URL}/payments/wallet/process`,
        { reference },
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new QuidaxError(
          response.data.message || 'Wallet payment processing failed',
          'WALLET_PAYMENT_FAILED',
          response.status
        );
      }

      return response.data;
    } catch (error) {
      console.error('Wallet payment processing error:', error);
      throw error;
    }
  }
}