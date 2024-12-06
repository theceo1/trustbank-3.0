// app/lib/services/wallet.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { TradeDetails } from '@/app/types/trade';
import { WalletBalance } from '@/app/types/market';

export interface WalletData {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  total_deposits: number;
  total_withdrawals: number;
  pending_balance: number;
  last_transaction_at: string;
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
  private static DEFAULT_CURRENCIES = ['NGN', 'BTC', 'ETH', 'USDT', 'USDC'];

  static async getOrCreateWallet(userId: string, currency: string): Promise<WalletData | null> {
    try {
      // First try to get existing wallet
      const { data: existingWallet, error: fetchError } = await this.supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('currency', currency)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingWallet) return existingWallet;

      // Create new wallet if none exists
      const { data: newWallet, error: createError } = await this.supabase
        .from('wallets')
        .insert({
          user_id: userId,
          currency,
          balance: 0,
          total_deposits: 0,
          total_withdrawals: 0,
          pending_balance: 0,
          last_transaction_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return null;
      }

      return newWallet;
    } catch (error) {
      console.error('Error in getOrCreateWallet:', error);
      return null;
    }
  }

  static async getUserWallet(userId: string): Promise<WalletData[]> {
    try {
      const { data, error } = await this.supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return this.createInitialWallets(userId);
      }

      return data;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      return [];
    }
  }

  private static async createInitialWallets(
    userId: string, 
    currencies = this.DEFAULT_CURRENCIES
  ): Promise<WalletData[]> {
    try {
      const walletsToCreate = currencies.map(currency => ({
        user_id: userId,
        currency,
        balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        pending_balance: 0,
        last_transaction_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await this.supabase
        .from('wallets')
        .upsert(walletsToCreate)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error creating wallets:', error);
      return [];
    }
  }
  static async getWalletBalance(userId: string): Promise<WalletBalance[]> {
    const { data, error } = await this.supabase
      .from('wallets')
      .select('currency, balance, pending_balance')
      .eq('user_id', userId)
      .then(({ data }) => ({
        data: data?.map(row => ({
          currency: row.currency,
          available: row.balance,
          pending: row.pending_balance
        })),
        error: null
      }));

    if (error) throw error;
    return data || [];
  }

  static async processTradePayment(userId: string, tradeDetails: TradeDetails) {
    try {
      const { data, error } = await this.supabase.rpc('process_wallet_transaction', {
        p_user_id: userId,
        p_type: 'trade_payment',
        p_amount: tradeDetails.total,
        p_currency: tradeDetails.currency,
        p_trade_id: tradeDetails.id,
        p_metadata: {
          trade_type: tradeDetails.type,
          rate: tradeDetails.rate,
          fees: tradeDetails.fees
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Trade payment error:', error);
      throw error;
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
}