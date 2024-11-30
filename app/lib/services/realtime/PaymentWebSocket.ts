import { createClient } from '@supabase/supabase-js';
import { PaymentStatus } from '@/app/types/payment';

export class PaymentWebSocket {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  static subscribeToPaymentUpdates(
    tradeId: string,
    onUpdate: (status: PaymentStatus) => void
  ) {
    const channel = this.supabase
      .channel(`payment_status_${tradeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trades',
          filter: `id=eq.${tradeId}`
        },
        (payload) => {
          onUpdate(payload.new.status);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}