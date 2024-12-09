// app/lib/services/wallet.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export interface WalletData {
  currency: string;
  balance: string;
  pending: string;
}

interface PaymentProcessResult {
  reference: string;
  status: 'completed' | 'failed';
}

interface QuidaxWalletUpdate {
  event: string;
  data: {
    id: string;
    currency: string;
    balance: string;
    locked: string;
    staked: string;
    converted_balance: string;
    reference_currency: string;
    is_crypto: boolean;
    deposit_address?: string;
    updated_at: string;
  };
}

export class WalletService {
  private static supabase = createClientComponentClient<Database>();

  static async getWalletBalance(userId: string): Promise<WalletData[]> {
    try {
      const { data: wallets, error } = await this.supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .throwOnError();

      if (error) throw error;

      const currencies = ['btc', 'eth', 'usdt', 'usdc', 'ngn'];
      const defaultWallet = {
        balance: '0',
        pending: '0'
      };

      return currencies.map(currency => {
        const wallet = wallets?.find(w => w.currency.toLowerCase() === currency.toLowerCase());
        return {
          currency: currency.toLowerCase(),
          ...defaultWallet,
          ...(wallet && { balance: wallet.balance.toString() })
        };
      });
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      // Return default balances instead of throwing
      return ['btc', 'eth', 'usdt', 'usdc', 'ngn'].map(currency => ({
        currency,
        balance: '0',
        pending: '0'
      }));
    }
  }

  static async updateWalletBalance(userId: string, currency: string, balance: string) {
    try {
      const { error } = await this.supabase
        .from('wallets')
        .upsert({
          user_id: userId,
          currency: currency.toLowerCase(),
          balance: parseFloat(balance) || 0,
          updated_at: new Date().toISOString()
        })
        .throwOnError();

      if (error) throw error;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw new Error('Failed to update balance');
    }
  }


  static async getTransactionHistory(userId: string, currency?: string) {
    const query = this.supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (currency) {
      query.eq('currency', currency);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getUserBalance(userId: string): Promise<number> {
    const { data } = await this.supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
    return data?.balance || 0;
  }

  static async updateBalance(userId: string, amount: number): Promise<void> {
    const { error } = await this.supabase.rpc('update_wallet_balance', {
      p_user_id: userId,
      p_amount: amount
    });

    if (error) throw error;
  }

  static async processPayment(params: {
    amount: number;
    currency: string;
    tradeId: string;
  }): Promise<PaymentProcessResult> {
    try {
      // Process payment logic here
      return {
        reference: `WAL_${params.tradeId}_${Date.now()}`,
        status: 'completed'
      };
    } catch (error) {
      throw error;
    }
  }

  static async handleWalletUpdate(payload: QuidaxWalletUpdate) {
    const { data } = payload;
    
    try {
      const { error } = await this.supabase
        .from('wallets')
        .upsert({
          currency: data.currency,
          balance: parseFloat(data.balance),
          pending_balance: parseFloat(data.locked),
          last_transaction_at: data.updated_at,
          updated_at: new Date().toISOString()
        })
        .eq('currency', data.currency);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update wallet:', error);
      throw error;
    }
  }

  static async transferToExchange(userId: string, amount: number): Promise<void> {
    // Start a transaction
    const { data: wallet } = await this.supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Update user's wallet balance
    const { error } = await this.supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async checkBalance(currency: string): Promise<number> {
    try {
      const response = await fetch(`/api/wallet/balance?currency=${currency}`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error('Check balance error:', error);
      return 0;
    }
  }
}