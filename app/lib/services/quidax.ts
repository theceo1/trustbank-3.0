import { QUIDAX_CONFIG } from '../config/quidax';
import { createHmac } from 'crypto';
import { QuidaxUser, QuidaxWebhookEvent } from '@/app/types/quidax';

export class QuidaxError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'QuidaxError';
  }
}

interface WalletAddress {
  id: string;
  address: string;
  network: string;
  currency: string;
}

interface QuidaxResponse<T> {
  status: string;
  message: string;
  data: T;
}

export class QuidaxService {
  private static readonly baseUrl = QUIDAX_CONFIG.apiUrl;
  private static readonly apiKey = QUIDAX_CONFIG.apiKey;
  private static readonly webhookSecret = QUIDAX_CONFIG.webhookSecret;

  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!QuidaxService.apiKey) {
      throw new Error('Quidax API key not configured');
    }

    const response = await fetch(`${QuidaxService.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${QuidaxService.apiKey}`,
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    return data;
  }

  static async fetchWalletAddress(userId: string, currency: string): Promise<{ data: { address: string; tag?: string } }> {
    try {
      const response = await QuidaxService.makeRequest<{ data: { address: string; tag?: string } }>(
        `/users/${userId}/wallets/${currency.toLowerCase()}/address`
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      throw error;
    }
  }

  static async fetchWalletAddresses(userId: string): Promise<{ data: Array<{ currency: string; address: string; tag?: string }> }> {
    try {
      const response = await QuidaxService.makeRequest<{ data: Array<{ currency: string; address: string; tag?: string }> }>(
        `/users/${userId}/wallets`
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
      throw error;
    }
  }

  static async createWalletAddress(userId: string, currency: string): Promise<{ data: { address: string; tag?: string } }> {
    try {
      const response = await QuidaxService.makeRequest<{ data: { address: string; tag?: string } }>(
        `/users/${userId}/wallets/${currency.toLowerCase()}/address`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error creating wallet address:', error);
      throw error;
    }
  }

  static async fetchOrderBook(market: string): Promise<Response> {
    const url = `${QuidaxService.baseUrl}/markets/${market}/order_book`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QuidaxService.apiKey}`
      }
    });
    return response;
  }

  static async createSwapQuotation(params: any): Promise<Response> {
    const response = await fetch(`${QuidaxService.baseUrl}/instant_orders/quote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QuidaxService.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response;
  }

  static async confirmSwap(params: any): Promise<Response> {
    const response = await fetch(`${QuidaxService.baseUrl}/instant_orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QuidaxService.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response;
  }

  static async getWalletBalance(userId: string, currency: string): Promise<{ data: { balance: string } }> {
    const response = await fetch(
      `${QuidaxService.baseUrl}/users/${userId}/wallets/${currency.toLowerCase()}`,
      {
        headers: {
          'Authorization': `Bearer ${QuidaxService.apiKey}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get wallet balance');
    }

    return response.json();
  }

  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: string,
    currency: string
  ): Promise<{ success: boolean; data: { id: string; status: string } }> {
    const response = await fetch(
      `${QuidaxService.baseUrl}/users/${fromUserId}/withdraws`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${QuidaxService.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currency: currency.toLowerCase(),
          amount,
          fund_uid: toUserId,
          transaction_note: 'Internal transfer',
          narration: 'Fund transfer'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Transfer failed');
    }

    const result = await response.json();
    return {
      success: result.status === 'success',
      data: result.data
    };
  }

  static verifyWebhookSignature(webhook: QuidaxWebhookEvent, signature?: string): boolean {
    if (!QuidaxService.webhookSecret || !signature) {
      return false;
    }

    const hmac = createHmac('sha256', QuidaxService.webhookSecret);
    const calculatedSignature = hmac
      .update(JSON.stringify(webhook))
      .digest('hex');

    return signature === calculatedSignature;
  }

  // Helper method to map status
  static mapQuidaxStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'done': 'completed',
      'cancelled': 'failed',
      'failed': 'failed',
      'pending': 'pending',
      'processing': 'processing'
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  static async createSubAccount(params: {
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<{ data: { id: string } }> {
    const response = await fetch(`${QuidaxService.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QuidaxService.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create sub-account');
    }

    return response.json();
  }
} 