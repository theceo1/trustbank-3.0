//app/lib/services/quidax-wallet.ts
import { QUIDAX_CONFIG } from '../config/quidax';

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
  private static readonly BASE_URL = '/api/wallet';
  private static instance: QuidaxWalletService;
  private token: string;

  private constructor() {
    this.token = QUIDAX_CONFIG.apiKey;
  }

  static getInstance(): QuidaxWalletService {
    if (!QuidaxWalletService.instance) {
      QuidaxWalletService.instance = new QuidaxWalletService();
    }
    return QuidaxWalletService.instance;
  }

  setToken(token: string) {
    if (!token) {
      console.warn('No token provided, using default API key');
      this.token = QUIDAX_CONFIG.apiKey;
      return;
    }
    this.token = token;
  }

  async getAllWallets(userId: string): Promise<WalletResponse> {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch wallet details.');
      }

      console.log('Fetching wallets for user:', userId);
      
      // Make request to our API route instead of Quidax directly
      const response = await fetch(`${QuidaxWalletService.BASE_URL}/${userId}`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Wallet API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch wallets');
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.data)) {
        console.error('Invalid wallet data:', data);
        throw new Error('Invalid wallet data received');
      }

      return {
        status: 'success',
        message: 'Wallets retrieved successfully',
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }

  async getWallet(userId: string, currency: string): Promise<WalletResponse> {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch wallet details.');
      }

      console.log('Fetching wallet for user:', userId, 'currency:', currency);
      const response = await fetch(
        `${QuidaxWalletService.BASE_URL}/${userId}/${currency}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Wallet API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch wallet');
      }

      const data = await response.json();
      if (data.status !== 'success' || !data.data) {
        console.error('Invalid wallet data:', data);
        throw new Error('Invalid wallet data received');
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${currency} wallet:`, error);
      throw error;
    }
  }

  async createSubAccount(email: string, name: string): Promise<any> {
    try {
      const [firstName, lastName] = name.split(' ');
      const response = await fetch(`${QuidaxWalletService.BASE_URL}/create-subaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          first_name: firstName || name,
          last_name: lastName || 'User'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create Quidax sub-account');
      }

      return response.json();
    } catch (error) {
      console.error('Create sub-account error:', error);
      throw error;
    }
  }
}

export const getWalletService = () => QuidaxWalletService.getInstance(); 