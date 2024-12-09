// app/lib/services/unified-trade.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradeDetails, CreateTradeParams, QuidaxTradeResponse } from '@/app/types/trade';
import { QuidaxService } from './quidax';
import { Database } from '@/app/types/database';

export class UnifiedTradeService {
  private static supabase = createClientComponentClient<Database>();

  static async createTrade(tradeDetails: TradeDetails): Promise<TradeDetails> {
    try {
      // First create trade in Quidax
      const quidaxTrade = await QuidaxService.createTrade({
        amount: tradeDetails.amount,
        currency: tradeDetails.currency,
        type: tradeDetails.type,
        paymentMethod: tradeDetails.payment_method,
        reference: `TR-${Date.now()}`
      });

      // Mirror the trade in our database
      const { data: localTrade, error } = await this.supabase
        .from('trades')
        .insert({
          ...tradeDetails,
          quidax_id: quidaxTrade.id,
          quidax_reference: quidaxTrade.reference,
          status: quidaxTrade.status
        })
        .select()
        .single();

      if (error) throw error;
      return localTrade;
    } catch (error) {
      console.error('Trade creation error:', error);
      throw error;
    }
  }

  static async getTradeHistory(userId: string): Promise<TradeDetails[]> {
    try {
      const { data: trades, error } = await this.supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return trades || [];
    } catch (error) {
      console.error('Trade history fetch error:', error);
      throw error;
    }
  }
} 