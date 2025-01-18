//app/lib/services/quidax-wallet.ts
import { createClient } from '@supabase/supabase-js';

export class WalletService {
  private quidaxBaseUrl: string;
  private quidaxSecretKey: string;
  private supabase: any;

  constructor() {
    this.quidaxBaseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
    this.quidaxSecretKey = process.env.QUIDAX_SECRET_KEY || '';
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async setupWallet(userId: string) {
    try {
      // First check if user already has a quidax_id
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile?.quidax_id) {
        return { success: true, quidax_id: profile.quidax_id };
      }

      // Create Quidax account
      const response = await fetch(`${this.quidaxBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.quidaxSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: profile.email,
          first_name: profile.full_name.split(' ')[0],
          last_name: profile.full_name.split(' ').slice(1).join(' '),
          phone: profile.phone || '',
          country: profile.country || 'NG'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create Quidax account');
      }

      const { data: quidaxUser } = await response.json();

      // Update user profile with quidax_id
      await this.supabase
        .from('user_profiles')
        .update({ quidax_id: quidaxUser.id })
        .eq('user_id', userId);

      // Generate wallet addresses for major cryptocurrencies
      const currencies = ['btc', 'eth', 'usdt'];
      for (const currency of currencies) {
        try {
          await fetch(`${this.quidaxBaseUrl}/users/${quidaxUser.id}/wallets/${currency}/address`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.quidaxSecretKey}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error(`Error generating ${currency} address:`, error);
          // Continue with other currencies even if one fails
        }
      }

      return { success: true, quidax_id: quidaxUser.id };
    } catch (error) {
      console.error('Error setting up wallet:', error);
      throw error;
    }
  }

  async getAllWallets(quidaxId: string) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.quidaxBaseUrl}/users/${quidaxId}/wallets`, {
        headers: {
          'Authorization': `Bearer ${this.quidaxSecretKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch wallets');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching wallets:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout while fetching wallets');
      }
      throw error;
    }
  }
}

let walletService: WalletService;

export function getWalletService() {
  if (!walletService) {
    walletService = new WalletService();
  }
  return walletService;
} 