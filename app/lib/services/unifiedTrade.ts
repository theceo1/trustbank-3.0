// app/lib/services/unifiedTrade.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { QuidaxClient } from './quidax-client';

interface TradeParams {
  user_id: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  total: number;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  payment_method: string;
}

export class UnifiedTradeService {
  private static supabase = createClientComponentClient<Database>();
  private static quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');

  static async createTrade(params: TradeParams): Promise<TradeDetails> {
    try {
      // Get quote from Quidax
      const rate = await this.quidaxClient.getRate(
        params.currency.toLowerCase(),
        'ngn'
      );

      if (!rate) throw new Error('Failed to get rate');

      // Create trade record
      const tradeData = {
        user_id: params.user_id,
        type: params.type,
        currency: params.currency,
        amount: params.amount,
        rate: Number(rate),
        total: params.total,
        fees: params.fees,
        payment_method: params.payment_method,
        status: TradeStatus.PENDING,
        reference: `TRADE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: trade, error } = await this.supabase
        .from('trades')
        .insert(tradeData)
        .select()
        .single();

      if (error) throw error;
      return trade;
    } catch (error) {
      console.error('Error creating trade:', error);
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
      console.error('Failed to fetch trade history:', error);
      throw error;
    }
  }

  static async validateTradeParams(params: TradeParams): Promise<boolean> {
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['buy', 'sell'].includes(params.type)) {
      throw new Error('Invalid trade type');
    }

    return true;
  }

  static async getRateForTrade(params: {
    amount: number;
    currency: string;
    type: 'buy' | 'sell';
  }) {
    try {
      const rate = await this.quidaxClient.getRate(
        params.currency.toLowerCase(),
        'ngn'
      );

      if (!rate) throw new Error('Failed to get rate');
      return rate;
    } catch (error) {
      console.error('Failed to get trade rate:', error);
      throw error;
    }
  }

  static async updateTradeStatus(
    tradeId: string, 
    status: TradeStatus, 
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('trades')
        .update({ 
          status,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update trade status:', error);
      throw error;
    }
  }

  static async getTradeStatus(tradeId: string): Promise<{ status: TradeStatus }> {
    try {
      const { data: trade, error } = await this.supabase
        .from('trades')
        .select('status')
        .eq('id', tradeId)
        .single();

      if (error) throw error;
      if (!trade) throw new Error('Trade not found');

      return { status: trade.status as TradeStatus };
    } catch (error) {
      console.error('Failed to get trade status:', error);
      throw error;
    }
  }

  static async getTrade(tradeId: string): Promise<TradeDetails> {
    try {
      const { data: trade, error } = await this.supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (error) throw error;
      if (!trade) throw new Error('Trade not found');

      return trade as TradeDetails;
    } catch (error) {
      console.error('Failed to fetch trade details:', error);
      throw error;
    }
  }
}