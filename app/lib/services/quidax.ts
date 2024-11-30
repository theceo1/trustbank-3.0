//app/lib/services/quidax.ts
import { CreateTradeParams, QuidaxTradeResponse, QuidaxRateParams, TradeDetails, OrderStatus, TradeType, TradeRateResponse } from '@/app/types/trade';
import { createHmac } from 'crypto';
import { CONFIG } from './config';
import { FEES } from '../constants/fees';
import { PaymentMethodType } from '@/app/types/payment';
import crypto from 'crypto';
import { MarketStats } from '@/app/types/market';

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

interface InstantSwapParams {
  user_id: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  type: 'buy' | 'sell';
}

export class QuidaxService {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${CONFIG.QUIDAX_API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.QUIDAX_API_KEY}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Quidax API request failed');
    }
    return response;
  }

  private static baseUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL;
  private static apiKey = process.env.QUIDAX_SECRET_KEY;
  private static webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET;

  static async getSwapRate(params: {
    from_currency: string;
    to_currency: string;
    amount: number;
  }) {
    try {
      const response = await fetch(
        `${this.baseUrl}/instant_swaps/quote?` + 
        new URLSearchParams({
          from_currency: params.from_currency,
          to_currency: params.to_currency,
          amount: params.amount.toString()
        }), {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get swap rate: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get swap rate error:', error);
      throw error;
    }
  }

  static async createInstantSwap(params: InstantSwapParams): Promise<QuidaxTradeResponse> {
    try {
      const response = await fetch(`${process.env.QUIDAX_API_URL}/instant-trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_API_KEY}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error('Failed to create instant swap');
      }

      return response.json();
    } catch (error) {
      console.error('Create swap error:', error);
      throw error;
    }
  }

  static async confirmInstantSwap(swapId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/instant_swaps/${swapId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to confirm swap: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Confirm swap error:', error);
      throw error;
    }
  }

  static async getRate(params: QuidaxRateParams) {
    try {
      const response = await fetch(
        `${this.baseUrl}/instant_orders/rate?` + 
        new URLSearchParams({
          amount: params.amount.toString(),
          currency_pair: params.currency_pair,
          type: params.type
        }), {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Rate fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        rate: Number(data.data.rate),
        total: Number(data.data.total),
        fees: {
          quidax: Number(data.data.fees?.quidax || 0),
          platform: Number(data.data.fees?.platform || 0),
          processing: Number(data.data.fees?.processing || 0)
        }
      };
    } catch (error) {
      console.error('Get rate error:', error);
      throw error;
    }
  }

  static async createTrade(params: CreateTradeParams): Promise<QuidaxTradeResponse> {
    const response = await this.makeRequest('/v1/trades', {
      method: 'POST',
      body: JSON.stringify(params)
    });

    return response.json();
  }

  static async getTradeDetails(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}`);
      return response.json();
    } catch (error) {
      console.error('Trade details fetch error:', error);
      throw error;
    }
  }

  static async getTradeStatus(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}/status`);
      return response.json();
    } catch (error) {
      console.error('Trade status fetch error:', error);
      throw error;
    }
  }

  static async processWalletPayment(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: 'wallet' })
      });
      return response.json();
    } catch (error) {
      console.error('Wallet payment error:', error);
      throw error;
    }
  }

  static async getPaymentDetails(tradeId: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${tradeId}/payment`);
      return response.json();
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw error;
    }
  }

  static verifyWebhookSignature(payload: any, signature?: string | null): boolean {
    if (!signature || !this.webhookSecret) return false;

    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }

  static mapQuidaxStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'success': 'completed',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'failed',
      'pending': 'pending',
      'processing': 'processing'
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  static async processPayment(trade: TradeDetails) {
    try {
      const response = await this.makeRequest(`/v1/trades/${trade.id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: trade.payment_method })
      });
      return response.json();
    } catch (error) {
      throw new Error('Failed to process payment');
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const response = await this.makeRequest(`/v1/trades/${reference}/verify`);
      return response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const response = await this.makeRequest(`/v1/orders/${orderId}`);
      return response.json();
    } catch (error) {
      console.error('Order status fetch error:', error);
      throw error;
    }
  }

  static async initializeBankTransfer(params: {
    amount: number;
    currency: string;
    reference: string;
  }) {
    try {
      const response = await this.makeRequest('/v1/bank_transfers/initialize', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    } catch (error) {
      console.error('Bank transfer initialization error:', error);
      throw error;
    }
  }

  static async initializeCardPayment(params: {
    amount: number;
    currency: string;
    tradeId: string;
    reference: string;
  }) {
    try {
      const response = await this.makeRequest('/v1/card_payments/initialize', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      return response.json();
    } catch (error) {
      console.error('Card payment initialization error:', error);
      throw error;
    }
  }

  static async getMarketStats(pair: string): Promise<MarketStats> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/markets/${pair}/stats`);
    const data = await response.json();
    
    // Transform the Quidax response into our MarketStats shape
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

  static async getDepositAddress(userId: string, currency: string) {
    try {
      const response = await this.makeRequest(`/v1/users/${userId}/wallets/${currency}/address`, {
        method: 'POST'
      });
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('Failed to get deposit address:', error);
      throw error;
    }
  }

  static async createInstantOrder(params: { 
    amount: number;
    bid: string;  // e.g., 'ngn'
    ask: string;  // e.g., 'btc'
    type: 'buy' | 'sell';
    unit: string; // e.g., 'ngn'
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/instant_orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          bid: params.bid,
          ask: params.ask,
          type: params.type,
          total: params.amount.toString(),
          unit: params.unit
        })
      });

      if (!response.ok) {
        throw new Error(`Instant order creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create instant order error:', error);
      throw error;
    }
  }

  static async confirmInstantOrder(orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/instant_orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Order confirmation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Confirm instant order error:', error);
      throw error;
    }
  }

  static async createAndConfirmTrade(params: { 
    amount: number;
    currency: string;
    type: 'buy' | 'sell';
    payment_method: PaymentMethodType;
  }) {
    try {
      // Step 1: Create instant order
      const [base, quote] = params.currency.split('_');
      const instantOrder = await this.createInstantOrder({
        amount: params.amount,
        bid: quote.toLowerCase(),
        ask: base.toLowerCase(),
        type: params.type,
        unit: quote.toLowerCase()
      });

      if (instantOrder.status !== 'success') {
        throw new Error(instantOrder.message || 'Failed to create instant order');
      }

      // Step 2: Confirm the order
      const confirmedOrder = await this.confirmInstantOrder(instantOrder.data.id);
      
      if (confirmedOrder.status !== 'success') {
        throw new Error(confirmedOrder.message || 'Failed to confirm order');
      }

      return {
        id: confirmedOrder.data.id,
        reference: confirmedOrder.data.reference,
        status: confirmedOrder.data.status,
        payment_url: confirmedOrder.data.payment_url
      };
    } catch (error) {
      console.error('Trade creation and confirmation error:', error);
      throw error;
    }
  }

  static async createSubAccount(userData: {
    email: string;
    first_name: string;
    last_name: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create sub-account: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create sub-account error:', error);
      throw error;
    }
  }

  static async generateWalletAddress(userId: string, currency: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/wallets/${currency}/address`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate wallet address: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Generate wallet address error:', error);
      throw error;
    }
  }

  static async getInstantRate({ amount, currency_pair, type }: {
    amount: number;
    currency_pair: string;
    type: 'buy' | 'sell';
  }) {
    // Implement Quidax API call
    const response = await fetch(`${process.env.QUIDAX_API_URL}/instant-rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency_pair, type })
    });

    const data = await response.json();
    return {
      rate: data.rate,
      total: data.total,
      fees: {
        quidax: data.fees.quidax,
        platform: data.fees.platform,
        processing: data.fees.processing
      }
    };
  }

  static async getBankDetails() {
    // Implement Quidax API call to get bank details
    const response = await fetch(`${process.env.QUIDAX_API_URL}/bank-accounts`, {
      headers: {
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
      }
    });

    return response.json();
  }

  static async checkPaymentStatus(reference: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.QUIDAX_API_URL}/payments/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      const data = await response.json();
      return this.mapQuidaxStatus(data.status);
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}