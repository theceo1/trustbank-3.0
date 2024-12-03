import axios from 'axios';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:http');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate required environment variables
if (!process.env.QUIDAX_API_URL || !process.env.QUIDAX_SECRET_KEY) {
  throw new Error('Missing required Quidax environment variables');
}

export class QuidaxService {
  private static baseUrl = process.env.QUIDAX_API_URL;
  private static secretKey = process.env.QUIDAX_SECRET_KEY;

  // User Management Methods
  static async verifyParentAccount() {
    try {
      const response = await axios.get(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      log('Verify parent account error:', error.response?.data || error);
      throw error;
    }
  }

  static async getOrCreateSubAccount(params: {
    email: string;
    first_name: string;
    last_name: string;
  }) {
    try {
      // First try to get existing sub-account by email
      const searchResponse = await axios.get(
        `${this.baseUrl}/users?email=${encodeURIComponent(params.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (searchResponse.data?.data?.length > 0) {
        log('Found existing sub-account');
        return searchResponse.data.data[0];
      }

      // If no existing account, create new one
      log('Creating new sub-account');
      const createResponse = await axios.post(
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

      return createResponse.data.data;
    } catch (error: any) {
      log('Get/Create sub-account error:', error.response?.data || error);
      throw error;
    }
  }

  static async getWalletInfo(userId: string, currency: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}/wallets/${currency}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      log('Get wallet info error:', error.response?.data || error);
      throw error;
    }
  }

  static async checkWalletBalance(userId: string, currency: string) {
    try {
      const walletInfo = await this.getWalletInfo(userId, currency);
      return {
        balance: walletInfo.balance,
        currency: walletInfo.currency,
        pending: walletInfo.pending || '0',
        deposit_address: walletInfo.deposit_address
      };
    } catch (error: any) {
      log('Check wallet balance error:', error.response?.data || error);
      throw error;
    }
  }

  // Swap Methods
  static async getTemporaryQuotation(userId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${userId}/temporary_swap_quotation`,
        {
          from_currency: params.from_currency.toLowerCase(),
          to_currency: params.to_currency.toLowerCase(),
          from_amount: params.from_amount
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      log('Get temporary quotation error:', error.response?.data || error);
      throw error;
    }
  }

  static async createSwapQuotation(userId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${userId}/swap_quotation`,
        {
          from_currency: params.from_currency.toLowerCase(),
          to_currency: params.to_currency.toLowerCase(),
          from_amount: params.from_amount
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
      log('Create swap quotation error:', error.response?.data || error);
      throw error;
    }
  }

  static async confirmSwapQuotation(userId: string, quotationId: string) {
    try {
      const url = `${this.baseUrl}/users/${userId}/swap_quotation/${quotationId}/confirm`;
      log('Confirming swap quotation with URL:', url);
      
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      log('Confirmation response:', response.data);

      if (!response.data?.data) {
        throw new Error('Invalid confirmation response');
      }

      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorCode = error.response?.data?.data?.code;
      const fullError = {
        message: errorMessage,
        code: errorCode,
        details: error.response?.data,
        status: error.response?.status,
        url: `${this.baseUrl}/users/${userId}/swap_quotation/${quotationId}/confirm`
      };
      
      log('Confirm swap quotation error:', fullError);

      // Throw a more descriptive error
      throw new Error(`Failed to confirm swap: ${errorMessage} (Code: ${errorCode}, Status: ${error.response?.status})`);
    }
  }

  static async getSwapTransactions() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/swap_transactions`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      log('Get swap transactions error:', error.response?.data || error);
      throw error;
    }
  }

  static async getUserBalance(userId: string) {
    try {
      // Get NGN wallet balance
      const ngnWallet = await this.checkWalletBalance(userId, 'ngn');
      // Get USDT wallet balance
      const usdtWallet = await this.checkWalletBalance(userId, 'usdt');
      
      return {
        ngn: ngnWallet.balance,
        usdt: usdtWallet.balance
      };
    } catch (error: any) {
      log('Get user balance error:', error.response?.data || error);
      throw error;
    }
  }

  // Add webhook verification endpoint
  static async verifyWebhook(payload: any, signature: string) {
    // Verify webhook signature using your Quidax webhook secret
    // Implementation depends on your webhook secret from Quidax dashboard
    const webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET;
    // Add verification logic here
  }

  static async getTransactionStatus(transactionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/swap_transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      log('Get transaction status error:', error.response?.data || error);
      throw error;
    }
  }

  async handleWebhook(headers: any, body: any) {
    try {
      const [timestampSection, signatureSection] = headers['quidax-signature'].split(',');
      const [, timestamp] = timestampSection.split('=');
      const [, signature] = signatureSection.split('=');
      
      if (!this.verifyWebhookSignature(JSON.stringify(body), timestamp, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const { event, data } = body;
      await this.processWebhookEvent(event, data);

      return { status: 200, message: 'Webhook processed successfully' };
    } catch (error: any) {
      log('Webhook processing error:', error);
      throw error;
    }
  }

  private verifyWebhookSignature(payload: string, timestamp: string, signature: string): boolean {
    const webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET || '';
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    
    return computedSignature === signature;
  }

  private async processWebhookEvent(event: string, data: any) {
    switch (event) {
      case 'swap_transaction.completed':
      case 'swap_transaction.reversed':
      case 'swap_transaction.failed':
        await this.handleSwapTransaction(event, data);
        break;

      case 'wallet.updated':
        await this.handleWalletUpdate(data);
        break;

      default:
        log('Unhandled webhook event:', event);
    }
  }

  private async handleSwapTransaction(event: string, data: any) {
    const { id, status, from_currency, to_currency, from_amount, received_amount, user } = data;
    
    const { error: tradeError } = await supabase
      .from('trades')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        payment_status: status === 'completed' ? 'completed' : 'failed'
      })
      .eq('quidax_reference', id);

    if (tradeError) {
      log('Error updating trade record:', tradeError);
      return;
    }

    if (status === 'completed') {
      await this.updateWalletBalances(user.id, {
        [from_currency.toLowerCase()]: -parseFloat(from_amount),
        [to_currency.toLowerCase()]: parseFloat(received_amount)
      });
    }
  }

  private async handleWalletUpdate(data: any) {
    const { user, currency, balance } = data;
    await this.updateWalletBalances(user.id, {
      [currency.toLowerCase()]: parseFloat(balance)
    });
  }

  private async updateWalletBalances(userId: string, updates: Record<string, number>) {
    for (const [currency, amount] of Object.entries(updates)) {
      const { error } = await supabase.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_currency: currency,
        p_amount: amount
      });

      if (error) {
        log(`Error updating ${currency} wallet for user ${userId}:`, error);
      }
    }
  }

  static async monitorTransaction(transactionId: string, maxAttempts = 20) {
    let attempts = 0;
    const delay = 5000; // 5 seconds between checks
    
    const checkStatus = async (): Promise<any> => {
      try {
        const status = await this.getTransactionStatus(transactionId);
        log(`Transaction ${transactionId} status:`, status);

        if (status.status === 'completed') {
          // Update trade record in database
          const { error } = await supabase
            .from('trades')
            .update({
              status: status.status,
              completed_at: new Date().toISOString()
            })
            .eq('quidax_reference', transactionId);

          if (error) {
            log('Error updating trade record:', error);
          }

          return status;
        }

        if (status.status === 'failed' || status.status === 'reversed') {
          throw new Error(`Transaction ${status.status}: ${status.message || 'No error message provided'}`);
        }

        if (attempts >= maxAttempts) {
          throw new Error(`Transaction monitoring timeout after ${maxAttempts} attempts`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
        return checkStatus();

      } catch (error: any) {
        log('Transaction monitoring error:', error.response?.data || error);
        throw error;
      }
    };

    return checkStatus();
  }
} 