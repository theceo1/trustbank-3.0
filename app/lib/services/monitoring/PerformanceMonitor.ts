import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MetricsService } from './MetricsService';

export class PerformanceMonitor {
  private static supabase = createClientComponentClient();

  static async trackPaymentMetrics(params: {
    tradeId: string;
    startTime: number;
    endTime: number;
    status: string;
    paymentMethod: string;
  }) {
    const duration = params.endTime - params.startTime;

    await this.supabase.from('payment_metrics').insert({
      trade_id: params.tradeId,
      duration_ms: duration,
      status: params.status,
      payment_method: params.paymentMethod,
      timestamp: new Date().toISOString()
    });

    // Send to monitoring service
    await MetricsService.logMetric('payment_processing_time', duration, {
      status: params.status,
      payment_method: params.paymentMethod
    });
  }

  static async getAverageProcessingTime(paymentMethod: string): Promise<number> {
    const { data } = await this.supabase
      .rpc('calculate_avg_processing_time', {
        p_payment_method: paymentMethod
      });

    return data || 0;
  }
}