//app/lib/services/quidax-wallet.ts
import { Database } from '@/app/types/supabase';
import supabaseClient from '@/lib/supabase/client';

interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
  total: string;
}

class QuidaxWalletService {
  private static instance: QuidaxWalletService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
    this.apiKey = process.env.NEXT_PUBLIC_QUIDAX_API_KEY || '';
  }

  public static getInstance(): QuidaxWalletService {
    if (!QuidaxWalletService.instance) {
      QuidaxWalletService.instance = new QuidaxWalletService();
    }
    return QuidaxWalletService.instance;
  }
 
  private async getHeaders() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-User-Token': session?.access_token || '',
    };
  }

  async getAllWallets(): Promise<WalletBalance[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}/wallets`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet balances');
      }

      const data = await response.json();
      return data.data.map((wallet: any) => ({
        currency: wallet.currency,
        balance: wallet.balance,
        locked: wallet.locked,
        total: (parseFloat(wallet.balance) + parseFloat(wallet.locked)).toString(),
      }));
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }
}

export const getWalletService = () => QuidaxWalletService.getInstance(); 