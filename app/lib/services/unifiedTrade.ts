// app/lib/services/unifiedTrade.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradeParams, TradeDetails, TradeStatus } from '@/app/types/trade';
import { QuidaxService } from './quidax';
import { Database } from '@/app/types/database';
import { handleError } from '@/app/lib/utils/errorHandler';
import { MarketRateService } from './market-rate';

export class UnifiedTradeService {
  private static supabase = createClientComponentClient<Database>();

  static async createTrade(params: TradeParams): Promise<TradeDetails> {
    try {
      // Create swap quotation in Quidax
      const quotation = await QuidaxService.createSwapQuotation({
        user_id: params.user_id,
        from_currency: params.currency.toLowerCase(),
        to_currency: 'ngn',
        from_amount: params.amount.toString()
      });

      const tradeDetails: TradeDetails = {
        user_id: params.user_id,
        type: params.type,
        currency: params.currency,
        amount: params.amount,
        rate: params.rate,
        total: params.amount * params.rate,
        fees: {
          platform: params.fees.service,
          processing: params.fees.network,
          total: params.fees.service + params.fees.network
        },
        payment_method: params.paymentMethod,
        status: TradeStatus.PENDING,
        reference: quotation.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store in database
      const { data: localTrade, error } = await this.supabase
        .from('trades')
        .insert(tradeDetails)
        .select()
        .single();

      if (error) throw error;
      return localTrade;
    } catch (error) {
      throw handleError(error, 'Failed to create trade');
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
      throw handleError(error, 'Failed to fetch trade history');
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
    return await MarketRateService.getRate({
      amount: params.amount,
      currency_pair: `${params.currency.toLowerCase()}_ngn`,
      type: params.type
    });
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
      throw handleError(error, 'Failed to update trade status');
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
      throw handleError(error, 'Failed to get trade status');
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
      throw handleError(error, 'Failed to fetch trade details');
    }
  }
}