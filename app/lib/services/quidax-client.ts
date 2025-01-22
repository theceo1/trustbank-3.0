import { env } from '@/env.mjs';

export const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

export interface QuidaxUser {
  id: string;
  email: string;
  is_verified: boolean;
  kyc_status: string;
  first_name?: string;
  last_name?: string;
}

export interface QuidaxWallet {
  id: string;
  name?: string;
  currency: string;
  balance: string;
  locked: string;
  pending_debit: string;
  pending_credit: string;
  total: string;
  staked?: string;
  converted_balance?: string;
  address?: string;
  tag?: string;
  blockchain_enabled?: boolean;
  deposit_address?: string | null;
  destination_tag?: string | null;
  reference_currency?: string;
  is_crypto?: boolean;
  created_at?: string;
  updated_at?: string;
  default_network?: string | null;
  networks?: {
    id: string;
    name: string;
    deposits_enabled: boolean;
    withdraws_enabled: boolean;
  }[];
}

export interface SwapQuotation {
  id: string;
  status: string;
  base: string;
  quote: string;
  amount: string;
  side: string;
  price: string;
  fee: string;
  total: string;
  expires_at: string;
}

export interface SwapResponse {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  received_amount: string;
  execution_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  swap_quotation: SwapQuotation;
  user: {
    id: string;
    sn: string;
    email: string;
    reference: string | null;
    first_name: string;
    last_name: string;
    display_name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface SwapQuotationResponse {
  id: string;
  from_currency: string;
  to_currency: string;
  quoted_price: string;
  quoted_currency: string;
  from_amount: string;
  to_amount: string;
  confirmed: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    sn: string;
    email: string;
    reference: string | null;
    first_name: string;
    last_name: string;
    display_name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateSubAccountParams {
  email: string;
  first_name?: string;
  last_name?: string;
  country: string;
}

export interface QuidaxResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface QuidaxTickerResponse {
  status: string;
  message: string;
  data: {
    ticker: {
      name: string;
      base_unit: string;
      quote_unit: string;
      low: string;
      high: string;
      last: string;
      type: string;
      volume: string;
      volume_in_quote: string;
      quote_volume: string;
      avg_price: string;
      price_change_percent: string;
      at: number;
    }
  }
}

export interface QuidaxOrderBookResponse {
  status: string;
  message: string;
  data: {
    asks: Array<{
      id: string;
      side: 'sell';
      ord_type: string;
      price: string;
      avg_price: string;
      state: string;
      currency: string;
      origin_volume: string;
      volume: string;
      executed_volume: string;
      trades_count: number;
      created_at: string;
      updated_at: string;
    }>;
    bids: Array<{
      id: string;
      side: 'buy';
      ord_type: string;
      price: string;
      avg_price: string;
      state: string;
      currency: string;
      origin_volume: string;
      volume: string;
      executed_volume: string;
      trades_count: number;
      created_at: string;
      updated_at: string;
    }>;
  }
}

export interface MarketHistoryResponse {
  status: string;
  message: string;
  data: Array<{
    timestamp: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
}

export class QuidaxClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: HeadersInit;

  constructor(apiKey: string) {
    this.baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
  }

  static getInstance(): QuidaxClient {
    if (!process.env.QUIDAX_SECRET_KEY) {
      throw new Error('Quidax API key not configured');
    }
    return new QuidaxClient(process.env.QUIDAX_SECRET_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      console.log(`[QuidaxClient] Making request to ${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[QuidaxClient] Failed to parse response:', {
          status: response.status,
          statusText: response.statusText,
          responseText,
          parseError
        });
        throw new Error(`Invalid response from Quidax API: ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('[QuidaxClient] Request failed:', {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          error: responseData
        });

        // Handle specific Quidax error messages
        if (responseData.errors) {
          const errorMessage = Object.values(responseData.errors).join(', ');
          // If this is a deposit address request and the error is about no address, return null
          if (endpoint.includes('/address') && errorMessage.includes('No deposit address')) {
            return { status: 'success', data: { address: null } } as T;
          }
          throw new Error(errorMessage);
        }

        // If this is a deposit address request and the error is about no address, return null
        if (endpoint.includes('/address') && responseData.message?.includes('No deposit address')) {
          return { status: 'success', data: { address: null } } as T;
        }

        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      if (responseData.status === 'error') {
        console.error('[QuidaxClient] Quidax API returned error status:', responseData);
        // If this is a deposit address request and the error is about no address, return null
        if (endpoint.includes('/address') && responseData.message?.includes('No deposit address')) {
          return { status: 'success', data: { address: null } } as T;
        }
        throw new Error(responseData.message || 'Quidax API returned error status');
      }

      return responseData;
    } catch (error: any) {
      console.error('[QuidaxClient] Request error:', {
        endpoint,
        error: error.message
      });
      throw error;
    }
  }

  async getTicker(market: string): Promise<QuidaxTickerResponse> {
    const formattedPair = market.toLowerCase();
    return this.request<QuidaxTickerResponse>(`/markets/tickers/${formattedPair}`);
  }

  async getOrderBook(market: string, askLimit: number = 20, bidsLimit: number = 20): Promise<QuidaxOrderBookResponse> {
    const formattedPair = market.toLowerCase();
    return this.request<QuidaxOrderBookResponse>(
      `/markets/${formattedPair}/order_book?ask_limit=${askLimit}&bids_limit=${bidsLimit}`
    );
  }

  async createSwapQuotation(userId: string, fromCurrency: string, toCurrency: string, fromAmount: string): Promise<SwapQuotationResponse> {
    return this.request<SwapQuotationResponse>(`/users/${userId}/swap_quotation`, {
      method: 'POST',
      body: JSON.stringify({
        from_currency: fromCurrency.toLowerCase(),
        to_currency: toCurrency.toLowerCase(),
        from_amount: fromAmount
      })
    });
  }

  async confirmSwapQuotation(userId: string, quotationId: string): Promise<SwapResponse> {
    return this.request<SwapResponse>(`/users/${userId}/swap_quotation/${quotationId}/confirm`, {
      method: 'POST'
    });
  }

  async getWalletBalance(userId: string, currency: string): Promise<QuidaxResponse<QuidaxWallet>> {
    return this.request<QuidaxResponse<QuidaxWallet>>(`/users/${userId}/wallets/${currency.toLowerCase()}`);
  }

  async fetchUserWallets(userId: string): Promise<QuidaxResponse<QuidaxWallet[]>> {
    return this.request<QuidaxResponse<QuidaxWallet[]>>(`/users/${userId}/wallets`);
  }

  async getDepositAddress(userId: string, currency: string): Promise<QuidaxResponse<{ address: string; tag?: string }>> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!currency) {
        throw new Error('Currency is required');
      }

      console.log('[QuidaxClient] Fetching deposit address:', {
        userId: userId === 'me' ? 'me' : '***',
        currency: currency.toLowerCase()
      });

      const response = await this.request<QuidaxResponse<{ address: string; tag?: string }>>(
        `/users/${userId}/wallets/${currency.toLowerCase()}/address`
      );

      if (!response.data?.address) {
        console.error('[QuidaxClient] No deposit address found:', response);
        throw new Error('No deposit address found for this currency');
      }

      console.log('[QuidaxClient] Successfully fetched deposit address');
      return response;
    } catch (error: any) {
      console.error('[QuidaxClient] Failed to get deposit address:', {
        userId: userId === 'me' ? 'me' : '***',
        currency,
        error: error.message
      });
      throw error;
    }
  }

  async getMarketHistory(market: string, period: string = '24h'): Promise<MarketHistoryResponse> {
    try {
      if (!market) {
        throw new Error('Market parameter is required');
      }

      const validPeriods = ['1h', '24h', '7d', '30d', '90d', '180d', '1y'];
      if (!validPeriods.includes(period)) {
        throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
      }

      const response = await this.request<MarketHistoryResponse>(`/markets/${market}/k-line?period=${period}`);
      
      if (!response?.data) {
        throw new Error('No market history data available');
      }

      return response;
    } catch (error: any) {
      console.error('Error fetching market history:', {
        market,
        period,
        error: error.message
      });
      throw error;
    }
  }

  async getTransactionStatus(reference: string): Promise<QuidaxResponse<{ status: string }>> {
    const response = await this.request<QuidaxResponse<{ status: string }>>(`/transactions/${reference}`);
    return response;
  }

  async getRate(base: string, quote: string): Promise<string | null> {
    return this.request<{ data: { last_price: string } }>(`/markets/${base}${quote}/ticker`)
      .then(data => data.data.last_price)
      .catch(() => null);
  }

  async getNetworks(currency: string): Promise<any[]> {
    return this.request<{ data: any[] }>(`/currencies/${currency}/networks`)
      .then(data => data.data)
      .catch(() => []);
  }

  async getUser(userId: string): Promise<QuidaxResponse<QuidaxUser>> {
    return this.request<QuidaxResponse<QuidaxUser>>(`/users/${userId}`);
  }

  async createWithdrawal(userId: string, params: { currency: string; amount: string; address: string; network?: string }) {
    return this.request<QuidaxResponse<any>>(`/users/${userId}/withdraws`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  verifyWebhookSignature(payload: any, signature?: string): boolean {
    if (!signature) {
      console.error('[QuidaxClient] No signature provided for webhook verification');
      return false;
    }

    try {
      // TODO: Implement proper signature verification using crypto
      // For now, we'll assume all webhooks are valid
      return true;
    } catch (error) {
      console.error('[QuidaxClient] Error verifying webhook signature:', error);
      return false;
    }
  }

  async transfer(senderId: string, receiverId: string, currency: string, amount: string): Promise<QuidaxResponse<any>> {
    return this.request<QuidaxResponse<any>>(`/users/${senderId}/transfers`, {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        currency: currency.toLowerCase(),
        amount
      })
    });
  }

  async createSubAccount(params: CreateSubAccountParams) {
    return this.request<QuidaxResponse<any>>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name,
        country: params.country.toLowerCase()
      })
    });
  }
} 