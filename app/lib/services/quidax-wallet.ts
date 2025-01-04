//app/lib/services/quidax-wallet.ts
import { QuidaxClient } from './quidax-client';

interface WalletResponse {
  data?: {
    wallets?: any[];
    transactions?: any[];
    balance?: string;
    available_balance?: string;
    pending_balance?: string;
    currency?: string;
    [key: string]: any;
  };
  error?: string;
}

interface TransferResponse {
  success: boolean;
  reference: string;
  status: string;
}

interface TransactionStatusResponse {
  status: string;
  reference: string;
  details?: any;
}

export class QuidaxWalletService {
  private static instance: QuidaxWalletService;
  private client: QuidaxClient;
  private isConfigured: boolean;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
    const apiKey = process.env.QUIDAX_SECRET_KEY;
    
    this.client = new QuidaxClient(apiUrl, apiKey);
    this.isConfigured = Boolean(apiUrl && apiKey);
    
    if (!this.isConfigured) {
      console.warn('Wallet service not properly configured. Some features may be unavailable.');
    }
  }

  static getInstance(): QuidaxWalletService {
    if (!QuidaxWalletService.instance) {
      QuidaxWalletService.instance = new QuidaxWalletService();
    }
    return QuidaxWalletService.instance;
  }

  private handleError(error: any, message: string): WalletResponse {
    console.error(message, error);
    if (process.env.NODE_ENV === 'development') {
      return {
        data: {
          currency: 'USDT',
          balance: '1000.00',
          available_balance: '1000.00',
          pending_balance: '0.00'
        }
      };
    }
    return { error: error.message || message };
  }

  async getAllWallets(userId: string): Promise<WalletResponse> {
    try {
      if (!this.isConfigured) {
        if (process.env.NODE_ENV === 'development') {
          return {
            data: {
              wallets: [{
                currency: 'USDT',
                balance: '1000.00',
                available_balance: '1000.00',
                pending_balance: '0.00'
              }]
            }
          };
        }
        throw new Error('Wallet service not configured');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await this.client.get(`/users/${userId}/wallets`);
      
      if (!response?.data) {
        throw new Error('Invalid response from wallet service');
      }

      return {
        data: {
          wallets: response.data
        }
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching wallets');
    }
  }

  async getWallet(userId: string, currency: string): Promise<WalletResponse> {
    try {
      if (!this.isConfigured) {
        if (process.env.NODE_ENV === 'development') {
          return {
            data: {
              currency: currency.toUpperCase(),
              balance: '1000.00',
              available_balance: '1000.00',
              pending_balance: '0.00'
            }
          };
        }
        throw new Error('Wallet service not configured');
      }

      if (!userId || !currency) {
        throw new Error('User ID and currency are required');
      }

      const response = await this.client.get(
        `/users/${userId}/wallets/${currency.toLowerCase()}`
      );
      
      if (!response?.data) {
        throw new Error('Invalid response from wallet service');
      }

      return {
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching wallet');
    }
  }

  async getTransactionHistory(userId: string): Promise<WalletResponse> {
    try {
      if (!this.isConfigured) {
        if (process.env.NODE_ENV === 'development') {
          return {
            data: {
              transactions: [{
                id: '1',
                type: 'credit',
                amount: '1000.00',
                currency: 'USDT',
                status: 'completed',
                created_at: new Date().toISOString()
              }]
            }
          };
        }
        throw new Error('Wallet service not configured');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await this.client.get(`/users/${userId}/transactions`);
      
      if (!response?.data) {
        throw new Error('Invalid response from wallet service');
      }

      return {
        data: {
          transactions: response.data
        }
      };
    } catch (error) {
      return this.handleError(error, 'Error fetching transaction history');
    }
  }

  async transfer(fromUserId: string, toUserId: string, amount: string, currency: string): Promise<TransferResponse> {
    try {
      if (!this.isConfigured) {
        throw new Error('Wallet service not configured');
      }

      const response = await this.client.post('/transfers', {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        currency: currency.toLowerCase()
      });

      if (!response?.data) {
        throw new Error('Invalid response from wallet service');
      }

      return {
        success: true,
        reference: response.data.reference,
        status: response.data.status
      };
    } catch (error) {
      const errorResponse = this.handleError(error, 'Error transferring funds');
      return {
        success: false,
        reference: '',
        status: 'failed',
        ...errorResponse
      };
    }
  }

  async getTransactionStatus(reference: string): Promise<TransactionStatusResponse> {
    try {
      if (!this.isConfigured) {
        throw new Error('Wallet service not configured');
      }

      const response = await this.client.get(`/transactions/${reference}`);

      if (!response?.data) {
        throw new Error('Invalid response from wallet service');
      }

      return {
        status: response.data.status,
        reference: response.data.reference,
        details: response.data
      };
    } catch (error) {
      const errorResponse = this.handleError(error, 'Error checking transaction status');
      return {
        status: 'failed',
        reference,
        details: errorResponse.error
      };
    }
  }
}

// Helper function to get wallet service instance
export function getWalletService(): QuidaxWalletService {
  return QuidaxWalletService.getInstance();
} 