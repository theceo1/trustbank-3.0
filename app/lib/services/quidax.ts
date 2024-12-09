// app/lib/services/quidax.ts
import { GetRateParams } from '../../types/trade';
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
  QuidaxMarketData 
} from '../../types/quidax';

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
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static secretKey = process.env.QUIDAX_SECRET_KEY!;

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

  static async getTemporaryQuotation(
    params: QuidaxQuotationParams
  ): Promise<QuidaxTemporaryQuotation> {
    return this.makeRequest(`/users/${params.user_id}/temporary_swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: params.from_currency,
        to_currency: params.to_currency,
        from_amount: params.from_amount
      })
    });
  }

  static async createSwapQuotation(
    params: QuidaxQuotationParams
  ): Promise<QuidaxQuotation> {
    return this.makeRequest(`/users/${params.user_id}/swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: params.from_currency,
        to_currency: params.to_currency,
        from_amount: params.from_amount,
        type: params.type
      })
    });
  }

  static async confirmSwapQuotation(
    userId: string, 
    quotationId: string
  ): Promise<QuidaxSwapTransaction> {
    return this.makeRequest(
      `/users/${userId}/swap_quotation/${quotationId}/confirm`,
      { method: 'POST' }
    );
  }

  static async refreshSwapQuotation(
    userId: string,
    quotationId: string,
    params: QuidaxQuotationParams
  ): Promise<QuidaxQuotation> {
    return this.makeRequest(
      `/users/${userId}/swap_quotation/${quotationId}/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({
          from_currency: params.from_currency,
          to_currency: params.to_currency,
          from_amount: params.from_amount
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

  static async getRate(params: GetRateParams) {
    return this.makeRequest<{
      price: { unit: string; amount: string };
      total: { unit: string; amount: string };
      volume: { unit: string; amount: string };
      fee: { unit: string; amount: string };
      receive: { unit: string; amount: string };
    }>(
      `/quotes?market=${params.currency_pair}&volume=${params.amount}&kind=${params.type}`
    );
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
}