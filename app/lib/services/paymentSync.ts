//app/lib/services/paymentSync.ts
import { createClient } from '@supabase/supabase-js';
import { QuidaxService } from "./quidax";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class PaymentSyncService {
    static async syncPaymentStatus(tradeId: string) {
      const { data: trade } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();
  
      if (!trade) throw new Error('Trade not found');
      if (!trade.quidax_reference) throw new Error('Quidax reference not found');
  
      const quidaxStatus = await QuidaxService.getTradeStatus(trade.quidax_reference);
      
      const { error } = await supabase
        .from('trades')
        .update({ status: quidaxStatus })
        .eq('id', tradeId);

      if (error) throw error;
  
      return quidaxStatus;
    } 
}