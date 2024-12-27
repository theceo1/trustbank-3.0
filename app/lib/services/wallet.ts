// app/lib/services/wallet.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import supabase from '@/lib/supabase/client';

export interface WalletData {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  pending_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  last_transaction_at: string;
}

interface PaymentProcessResult {
  reference: string;
  status: 'completed' | 'failed';
}

export interface QuidaxWalletUpdate {
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
  private static supabase = supabase;

  static async getWalletInfo(userId: string) {
    const { data, error } = await this.supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  static async getWalletAddress(userId: string, currency: string) {
    const { data, error } = await this.supabase
      .from('wallet_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    if (error) throw error;
    return data;
  }

  static async getWalletBalance(userId: string): Promise<WalletData | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', 'NGN')
      .single();

    if (error) throw error;
    return data;
  }

  static async updateWalletBalance(walletId: string, amount: number, type: 'credit' | 'debit') {
    const { data, error } = await supabase.rpc('update_wallet_balance', {
      p_wallet_id: walletId,
      p_amount: amount,
      p_type: type
    });

    if (error) throw error;
    return data;
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