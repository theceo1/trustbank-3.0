// app/lib/services/webhookLogger.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export class WebhookLogger {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  static async logWebhook(type: 'quidax' | 'payment' | 'dojah', payload: any, attempt = 1): Promise<string> {
    const supabase = createClientComponentClient();
    
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .insert({
          type,
          payload,
          status: 'received',
          attempt_count: attempt,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      if (attempt < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        return this.logWebhook(type, payload, attempt + 1);
      }
      console.error('Failed to log webhook after retries:', error);
      throw error;
    }
  }

  static async updateWebhookStatus(id: string, status: 'processed' | 'failed', error?: string) {
    const supabase = createClientComponentClient();
    
    try {
      await supabase
        .from('webhook_logs')
        .update({
          status,
          error_message: error,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (error) {
      console.error('Failed to update webhook status:', error);
    }
  }

  static async getWebhookLogs(type?: 'quidax' | 'payment' | 'dojah', limit = 100) {
    const supabase = createClientComponentClient();
    
    const query = supabase
      .from('webhook_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (type) {
      query.eq('type', type);
    }
      
    const { data } = await query;
    return data;
  }

  static async retryFailedWebhooks() {
    const supabase = createClientComponentClient();
    
    const { data: failedWebhooks } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('status', 'failed')
      .lt('attempt_count', this.MAX_RETRIES);

    if (!failedWebhooks) return;

    for (const webhook of failedWebhooks) {
      try {
        await this.processWebhook(webhook);
        await this.updateWebhookStatus(webhook.id, 'processed');
      } catch (error) {
        await this.updateWebhookStatus(webhook.id, 'failed', (error as Error).message);
      }
    }
  }

  private static async processWebhook(webhook: any) {
    // Implement webhook processing logic based on type
    switch (webhook.type) {
      case 'dojah':
        // Process Dojah webhook
        await fetch('/api/webhooks/dojah', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhook.payload)
        });
        break;
      // Add other webhook types as needed
    }
  }
} 