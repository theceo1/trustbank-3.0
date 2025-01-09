import { QuidaxUser, QuidaxWebhookEvent } from '@/app/types/quidax';
import { QuidaxMarketService } from './quidax-market';
import { QuidaxSwapService } from './quidax-swap';
import { createHmac } from 'crypto';

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

export class QuidaxService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;
  private static webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET;

  // User-related methods
  static async createUser(params: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    country?: string;
  }): Promise<QuidaxUser> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(params)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<QuidaxUser> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  static verifyWebhookSignature(webhook: QuidaxWebhookEvent, signature?: string): boolean {
    if (!this.webhookSecret || !signature) {
      return false;
    }

    const hmac = createHmac('sha256', this.webhookSecret);
    const calculatedSignature = hmac
      .update(JSON.stringify(webhook))
      .digest('hex');

    return signature === calculatedSignature;
  }

  // Market-related methods
  static getAllMarketTickers = QuidaxMarketService.getAllMarketTickers;
  static getMarketPrice = QuidaxMarketService.getMarketPrice;
  static getQuote = QuidaxMarketService.getQuote;

  // Swap-related methods
  static createSwapQuotation = QuidaxSwapService.createSwapQuotation;
  static confirmSwap = QuidaxSwapService.confirmSwap;
  static getSwapTransaction = QuidaxSwapService.getSwapTransaction;
  static getTemporaryQuotation = QuidaxSwapService.getTemporaryQuotation;

  // Wallet-related methods
  static async getWalletBalance(userId: string, currency: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/wallets/${currency}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new QuidaxError(
          error.message || 'Failed to fetch wallet balance',
          error.code || 'WALLET_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new QuidaxError(
          'Invalid response format',
          'INVALID_RESPONSE',
          500
        );
      }

      // Ensure data property exists and is an array
      if (!data.data || !Array.isArray(data.data)) {
        return {
          status: 'success',
          message: 'No wallet data found',
          data: []
        };
      }

      // Return the validated response
      return data;
    } catch (error) {
      console.error('Get wallet balance error:', error);
      throw error;
    }
  }

  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: string,
    currency: string
  ) {
    try {
      const response = await fetch(
        `${this.baseUrl}/transfers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            from_user_id: fromUserId,
            to_user_id: toUserId,
            amount,
            currency
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new QuidaxError(
          error.message || 'Failed to transfer funds',
          error.code || 'TRANSFER_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return {
        success: true,
        reference: data.data.id,
        status: data.data.status,
        ...data.data
      };
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }

  // Status mapping
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
} 