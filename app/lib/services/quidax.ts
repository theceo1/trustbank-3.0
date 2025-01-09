import { QuidaxUser, QuidaxWebhookEvent } from '@/app/types/quidax';
import { QuidaxMarketService } from './quidax-market';
import { QuidaxSwapService } from './quidax-swap';
import { createHmac } from 'crypto';

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
} 