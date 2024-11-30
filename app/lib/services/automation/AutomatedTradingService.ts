import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { UnifiedTradeService } from '../unifiedTrade';
import { AutomatedTradeRule } from '@/app/types/trade';

export class AutomatedTradingService {
  private static supabase = createClientComponentClient<Database>();

  static async createTradeRule(params: {
    userId: string;
    currency: string;
    amount: number;
    targetRate: number;
    tradeType: 'buy' | 'sell';
    expiresAt?: Date;
  }): Promise<AutomatedTradeRule> {
    const { data, error } = await this.supabase
      .from('automated_trade_rules')
      .insert({
        user_id: params.userId,
        currency: params.currency,
        amount: params.amount,
        target_rate: params.targetRate,
        trade_type: params.tradeType,
        expires_at: params.expiresAt,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async executeAutomatedTrade(ruleId: string) {
    const { data: rule } = await this.supabase
      .from('automated_trade_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (!rule) throw new Error('Trade rule not found');

    return await UnifiedTradeService.createTrade({
      user_id: rule.user_id,
      type: rule.trade_type,
      amount: rule.amount,
      currency: rule.currency,
      rate: rule.target_rate,
      total: rule.amount,
      fees: { service: 0, network: 0 },
      paymentMethod: 'wallet',
      reference: `AUTO_${ruleId}_${Date.now()}`
    });
  }
}