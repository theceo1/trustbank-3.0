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
  currency: string;
  balance: string;
  locked: string;
  pending_debit: string;
  pending_credit: string;
  total: string;
  address?: string;
  tag?: string;
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
}

export interface QuidaxResponse<T> {
  status: string;
  message: string;
  data: T;
}

export class QuidaxClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(apiKey: string, baseUrl = 'https://www.quidax.com/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 3;
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 0): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok && retries < this.maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        return this.fetchWithRetry(url, options, retries + 1);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  static async post(endpoint: string, data: any) {
    const response = await fetch(`https://www.quidax.com/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
      },
      body: JSON.stringify(data)
    });
    return response;
  }

  async fetchOrderBook(market: string) {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/markets/${market}/order_book`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Raw order book data:', JSON.stringify(data, null, 2));
      
      if (!data || !data.data || !data.data.asks || !data.data.bids) {
        throw new Error('Invalid order book data received');
      }

      // Transform the data into the expected format
      const transformOrders = (orders: any[]) => {
        if (!Array.isArray(orders)) return [];
        return orders.map(order => {
          // Check if order is an array (Quidax format) or object
          if (Array.isArray(order)) {
            const [price, volume] = order;
            return {
              price: price.toString(),
              volume: volume.toString(),
              total: (parseFloat(price) * parseFloat(volume)).toFixed(8)
            };
          }
          // If it's already an object with price and volume
          return {
            price: order.price.toString(),
            volume: order.volume.toString(),
            total: (parseFloat(order.price) * parseFloat(order.volume)).toFixed(8)
          };
        });
      };

      return {
        asks: transformOrders(data.data.asks),
        bids: transformOrders(data.data.bids)
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw error;
    }
  }

  async createSubAccount(data: { email: string; first_name?: string; last_name?: string }) {
    const response = await this.fetchWithRetry(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async fetchUserWallets(userId: string): Promise<QuidaxResponse<QuidaxWallet[]>> {
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/users/${userId}/wallets`);
      if (!response.ok) {
        throw new Error(`Failed to fetch wallets: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from Quidax API');
      }
      return data;
    } catch (error) {
      console.error('Error fetching user wallets:', error);
      throw error;
    }
  }

  async getWallet(userId: string, currency: string): Promise<QuidaxResponse<QuidaxWallet[]>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/users/${userId}/wallets/${currency.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  async getDepositAddress(userId: string, currency: string): Promise<QuidaxResponse<{ address: string; tag?: string }>> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/users/${userId}/wallets/${currency.toLowerCase()}/address`
      );
      if (!response.ok) {
        throw new Error(`Failed to get deposit address: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error getting deposit address:', error);
      throw error;
    }
  }

  async getTransactionStatus(reference: string) {
    const response = await this.fetchWithRetry(`${this.baseUrl}/transactions/${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });
    return response.json();
  }

  async getRate(base: string, quote: string) {
    const response = await this.fetchWithRetry(`${this.baseUrl}/markets/${base}${quote}/ticker`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data?.data?.last_price || null;
  }

  async confirmSwapQuotation(data: { user_id: string; quotation_id: string }) {
    const response = await this.fetchWithRetry(`${this.baseUrl}/swaps/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getNetworks(currency: string) {
    const response = await this.fetchWithRetry(`${this.baseUrl}/currencies/${currency}/networks`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data.data || [];
  }
} 