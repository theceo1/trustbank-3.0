import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { TradeDetails, TradeStatus } from '@/app/types/trade';

export class TradeService {
  private static supabase = createClientComponentClient<Database>();

  static async createTrade(data: {
    amount: number;
    currency: string;
    payment_method: string;
    user_id: string;
  }): Promise<TradeDetails> {
    try {
      const { data: trade, error } = await this.supabase
        .from('trades')
        .insert({
          amount: data.amount.toString(),
          currency: data.currency,
          payment_method: data.payment_method,
          user_id: data.user_id,
          status: TradeStatus.PENDING,
          reference: `TRADE_${Date.now()}_${Math.random().toString(36).substring(7)}`
        })
        .select()
        .single();

      if (error) throw error;
      return trade;
    } catch (error) {
      console.error('Error creating trade:', error);
      throw error;
    }
  }

  static async getTrade(id: string): Promise<TradeDetails | null> {
    try {
      const { data: trade, error } = await this.supabase
        .from('trades')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return trade;
    } catch (error) {
      console.error('Error fetching trade:', error);
      return null;
    }
  }

  static async updateTradeStatus(id: string, status: TradeStatus): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('trades')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating trade status:', error);
      throw error;
    }
  }

  static async handlePaymentWebhook(payload: any): Promise<void> {
    const { reference, status, metadata } = payload;
    
    try {
      const { data: trade, error } = await this.supabase
        .from('trades')
        .select('*')
        .eq('reference', reference)
        .single();

      if (error) throw error;
      if (!trade) throw new Error('Trade not found');

      await this.updateTradeStatus(trade.id, status as TradeStatus);
    } catch (error) {
      console.error('Webhook handler error:', error);
      throw error;
    }
  }
}