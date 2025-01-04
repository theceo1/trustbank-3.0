//app/lib/services/quidax-wallet.ts
import { QuidaxClient } from './quidax-client';

interface WalletData {
  id: string;
  currency: string;
  balance: string;
  locked: string;
  deposit_address?: string;
}

interface WalletResponse {
  status: string;
  message: string;
  data: WalletData[];
}

export class QuidaxWalletService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static instance: QuidaxWalletService;
  private token: string | null = null;

  private constructor() {
    // Private constructor to enforce singleton
    this.token = process.env.NEXT_PUBLIC_QUIDAX_API_KEY || null;
    if (!this.token) {
      console.warn('Wallet service not properly configured. Some features may be unavailable.');
    }
  }

  static getInstance(): QuidaxWalletService {
    if (!QuidaxWalletService.instance) {
      QuidaxWalletService.instance = new QuidaxWalletService();
    }
    return QuidaxWalletService.instance;
  }

  async getAllWallets(userId: string = 'me'): Promise<WalletResponse> {
    try {
      if (!this.token) {
        throw new Error('Wallet service not configured');
      }

      const response = await fetch(`${QuidaxWalletService.BASE_URL}/users/${userId}/wallets`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch wallets');
      }

      const data = await response.json();
      if (data.status !== 'success' || !Array.isArray(data.data)) {
        throw new Error('Invalid wallet data received');
      }

      return data;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }

  async getWallet(userId: string = 'me', currency: string): Promise<WalletResponse> {
    try {
      if (!this.token) {
        throw new Error('Wallet service not configured');
      }

      const response = await fetch(
        `${QuidaxWalletService.BASE_URL}/users/${userId}/wallets/${currency}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch wallet');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        throw new Error('Invalid wallet data received');
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${currency} wallet:`, error);
      throw error;
    }
  }
}

export const getWalletService = () => QuidaxWalletService.getInstance(); 