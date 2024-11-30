import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export class WebhookLogger {
  static async logWebhook(type: 'quidax' | 'payment', payload: any) {
    const supabase = createClientComponentClient();
    
    await supabase
      .from('webhook_logs')
      .insert({
        type,
        payload,
        timestamp: new Date().toISOString()
      });
  }

  static async getWebhookLogs() {
    const supabase = createClientComponentClient();
    
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
      
    return data;
  }
} 