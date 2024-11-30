import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';
import { RateAlert, AlertCondition } from '@/app/types/alerts';

export class RateAlertService {
  private static supabase = createClientComponentClient<Database>();

  static async createAlert(params: {
    userId: string;
    currency: string;
    targetRate: number;
    condition: AlertCondition;
    notificationMethod: 'email' | 'push' | 'both';
  }): Promise<RateAlert> {
    const { data, error } = await this.supabase
      .from('rate_alerts')
      .insert({
        user_id: params.userId,
        currency: params.currency,
        target_rate: params.targetRate,
        condition: params.condition,
        notification_method: params.notificationMethod,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getActiveAlerts(userId: string): Promise<RateAlert[]> {
    const { data, error } = await this.supabase
      .from('rate_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}