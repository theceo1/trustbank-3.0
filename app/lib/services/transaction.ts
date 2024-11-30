import supabase from '@/lib/supabase/client';
import { Transaction, FiatTransaction, CryptoTransaction, ReferralTransaction } from '@/app/types/transactions';

export interface TransactionFilters {
  status: string;
  dateRange: string;
}

export class TransactionService {
  static async getUserTransactions(
    userId: string, 
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status.toUpperCase());
        }

        if (filters.dateRange && filters.dateRange !== 'all') {
          const date = new Date();
          switch(filters.dateRange) {
            case 'today':
              date.setHours(0, 0, 0, 0);
              break;
            case 'week':
              date.setDate(date.getDate() - 7);
              break;
            case 'month':
              date.setMonth(date.getMonth() - 1);
              break;
          }
          query = query.gte('created_at', date.toISOString());
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }

  static async getReferralTransactions(filters: {
    status?: string;
    dateRange?: string;
  }): Promise<ReferralTransaction[]> {
    try {
      let query = supabase
        .from('referral_transactions')
        .select(`
          *,
          referrer:profiles!referrer_id(full_name, email),
          referred:profiles!referred_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status.toUpperCase());
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const date = new Date();
        switch(filters.dateRange) {
          case 'today':
            date.setHours(0, 0, 0, 0);
            break;
          case 'week':
            date.setDate(date.getDate() - 7);
            break;
          case 'month':
            date.setMonth(date.getMonth() - 1);
            break;
        }
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching referral transactions:', error);
      throw error;
    }
  }

  static subscribeToTransactions(userId: string, callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Transaction;
    old: Transaction | null;
  }) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static async createFiatTransaction(transaction: Omit<FiatTransaction, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async createTransaction(data: any) {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  static async updateTransaction(id: string, data: any) {
    const { error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  }

  static async getTransaction(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}