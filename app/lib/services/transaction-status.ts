import supabase from '@/lib/supabase/client';
import { TransactionStatus } from '@/app/types/transactions';

export class TransactionStatusService {
  static async updateStatus(
    transactionId: string, 
    status: TransactionStatus, 
    paymentReference?: string
  ) {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        status,
        payment_reference: paymentReference,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static subscribeToStatus(
    transactionId: string, 
    callback: (status: TransactionStatus) => void
  ) {
    return supabase
      .channel(`transaction-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`
        },
        (payload) => {
          callback(payload.new.status);
        }
      )
      .subscribe();
  }

  static async getTransaction(transactionId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  }
}