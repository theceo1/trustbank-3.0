//app/lib/services/quidax-wallet.ts
import { APIError } from '@/lib/api-utils';

interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
  total: string;
}

class QuidaxWalletService {
  private static instance: QuidaxWalletService;

  private constructor() {}

  public static getInstance(): QuidaxWalletService {
    if (!QuidaxWalletService.instance) {
      QuidaxWalletService.instance = new QuidaxWalletService();
    }
    return QuidaxWalletService.instance;
  }

  async getAllWallets(): Promise<WalletBalance[]> {
    try {
      const response = await fetch('/api/wallet/balances');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch wallet balances');
      }
      const data = await response.json();
      return data.wallets;
    } catch (error: any) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
  }
}

// Export a function to get the singleton instance
export function getWalletService(): QuidaxWalletService {
  return QuidaxWalletService.getInstance();
} 