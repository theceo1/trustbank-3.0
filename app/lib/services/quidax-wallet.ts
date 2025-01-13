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
  data: Array<{
    id: string;
    currency: string;
    balance: string;
    pending_balance: string;
    total_balance: string;
    total_deposits: string;
    total_withdrawals: string;
  }>;
}

export class QuidaxWalletService {
  private static readonly BASE_URL = 'https://www.quidax.com/api/v1';
  private static instance: QuidaxWalletService;
  private token: string;
  private timeout = 30000; // 30 seconds timeout
  private maxRetries = 3;

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

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = this.maxRetries): Promise<Response> {
    try {
      const response = await this.fetchWithTimeout(url, options);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API request failed with status ${response.status}`);
      }
      return response;
    } catch (error: any) {
      if (retries > 0 && (error.message === 'Request timeout' || error.name === 'AbortError')) {
        console.log(`Retrying request, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async getAllWallets(userId: string): Promise<WalletResponse> {
    try {
      if (!userId) {
        throw new Error('User ID is required to fetch wallet details.');
      }

      console.log('Fetching wallets for user:', userId);
      
      const response = await this.fetchWithRetry(`${QuidaxWalletService.BASE_URL}/users/${userId}/wallets`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        }
      });

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
      const response = await this.fetchWithRetry(
        `${QuidaxWalletService.BASE_URL}/users/${userId}/wallets/${currency}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (!data || !data.data) {
        console.error('Invalid wallet data:', data);
        throw new Error('Invalid wallet data received');
      }

      return {
        status: 'success',
        message: 'Wallet retrieved successfully',
        data: Array.isArray(data.data) ? data.data : [data.data]
      };
    } catch (error) {
      console.error(`Error fetching ${currency} wallet:`, error);
      throw error;
    }
  }

  async createSubAccount(email: string, name: string): Promise<any> {
    try {
      const [firstName, lastName] = name.split(' ');
      const response = await this.fetchWithRetry(`${QuidaxWalletService.BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          first_name: firstName || name,
          last_name: lastName || 'User'
        })
      });

      const data = await response.json();
      if (!data || !data.data) {
        throw new Error('Invalid response from Quidax');
      }

      return {
        status: 'success',
        message: 'Sub-account created successfully',
        data: data.data
      };
    } catch (error) {
      console.error('Create sub-account error:', error);
      throw error;
    }
  }
}

export const getWalletService = () => QuidaxWalletService.getInstance(); 