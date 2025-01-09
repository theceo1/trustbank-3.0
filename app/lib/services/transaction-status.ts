import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { PaymentStatus } from '@/app/types/payment';

interface TransactionPayload {
  new: {
    status: PaymentStatus;
  };
}

export class TransactionStatusService {
  private static supabase = createClientComponentClient<Database>();

  static async getStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select('status')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data.status;
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }

  static subscribeToStatus(
    transactionId: string,
    callback: (status: PaymentStatus) => void
  ): () => void {
    const channel = this.supabase
      .channel('transaction-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`
        },
        (payload: TransactionPayload) => {
          callback(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}