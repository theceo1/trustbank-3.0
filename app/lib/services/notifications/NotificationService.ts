import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

export class NotificationService {
  private static supabase = createClientComponentClient<Database>();

  static async sendNotification(params: {
    userId: string;
    type: 'rate_alert' | 'trade_execution' | 'system_alert';
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    // Store notification in database
    const { error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        metadata: params.metadata
      });

    if (error) throw error;

    // Send push notification if enabled
    if (await this.isPushEnabled(params.userId)) {
      await this.sendPushNotification(params);
    }

    // Send email notification if enabled
    if (await this.isEmailEnabled(params.userId)) {
      await this.sendEmailNotification(params);
    }
  }

  private static async isPushEnabled(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('push_enabled')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.push_enabled ?? false;
  }

  private static async isEmailEnabled(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('email_enabled')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.email_enabled ?? false;
  }

  private static async sendPushNotification(params: {
    userId: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    const { data: tokens } = await this.supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', params.userId);

    if (!tokens?.length) return;

    // Implement your push notification service here (e.g., Firebase Cloud Messaging)
    // This is a placeholder for the actual implementation
    await Promise.all(tokens.map(({ token }) => 
      fetch('/api/push-notification', {
        method: 'POST',
        body: JSON.stringify({
          token,
          title: params.title,
          message: params.message,
          data: params.metadata
        })
      })
    ));
  }

  private static async sendEmailNotification(params: {
    userId: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    const { data: user } = await this.supabase
      .from('users')
      .select('email')
      .eq('id', params.userId)
      .single();

    if (!user?.email) return;

    // Implement your email service here (e.g., SendGrid, AWS SES)
    // This is a placeholder for the actual implementation
    await fetch('/api/send-email', {
      method: 'POST',
      body: JSON.stringify({
        to: user.email,
        subject: params.title,
        text: params.message,
        metadata: params.metadata
      })
    });
  }

  static async getUnreadNotifications(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}