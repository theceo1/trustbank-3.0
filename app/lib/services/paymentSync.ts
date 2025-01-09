//app/lib/services/paymentSync.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { TradeStatus } from '@/app/types/trade';
import { QuidaxClient } from './quidax-client';

export class PaymentSync {
  private static supabase = createClientComponentClient<Database>();
  private static quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');

  static async syncTradeStatus(tradeId: string) {
    try {
      const { data: trade, error: fetchError } = await this.supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (fetchError) throw fetchError;
      if (!trade) throw new Error('Trade not found');
      if (!trade.reference) throw new Error('Quidax reference not found');
  
      const { status } = await this.quidaxClient.getTransactionStatus(trade.reference);
      
      const { error } = await this.supabase
        .from('trades')
        .update({ status: status as TradeStatus })
        .eq('id', trade.id);

      if (error) throw error;
      return { status };
    } catch (error) {
      console.error('Error syncing trade status:', error);
      throw error;
    }
  }
}