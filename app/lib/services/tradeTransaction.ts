import { createClient } from '@supabase/supabase-js';

export class TradeTransaction {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  static async revertTradeOnFailure(tradeId: string) {
    const { data: trade } = await this.supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (!trade) return;

    // Start transaction to revert trade
    const { error } = await this.supabase.rpc('revert_failed_trade', {
      p_trade_id: tradeId,
      p_user_id: trade.user_id,
      p_amount: trade.amount
    });

    if (error) {
      console.error('Failed to revert trade:', error);
      throw error;
    }
  }
}