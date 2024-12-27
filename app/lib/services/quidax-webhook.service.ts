// app/lib/services/quidax-webhook.service.ts

import { logger } from '@/app/lib/logger';
import { createClient } from '@supabase/supabase-js';
import { WebhookLogger } from './webhookLogger';
import { QuidaxService } from './quidax';
import { 
  QuidaxWebhookEvent, 
  TransactionType, 
  TransactionStatus 
} from '@/app/types/webhook';
import type { QuidaxWallet } from '@/app/types/quidax';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class QuidaxWebhookService {
  async handleWebhook(webhook: QuidaxWebhookEvent, signature?: string) {
    const logId = await WebhookLogger.logWebhook('quidax', webhook);

    try {
      // Verify webhook signature
      if (!QuidaxService.verifyWebhookSignature(webhook, signature)) {
        throw new Error('Invalid webhook signature');
      }

      logger.info(`Processing ${webhook.event} webhook`);

      switch (webhook.event) {
        case 'instant_order.done':
          await this.handleInstantOrderDone(webhook.data);
          break;
        case 'instant_order.cancelled':
          await this.handleInstantOrderCancelled(webhook.data);
          break;
        case 'instant_order.failed':
          await this.handleInstantOrderFailed(webhook.data);
          break;
        case 'swap_transaction.completed':
          await this.handleSwapCompleted(webhook.data);
          break;
        case 'swap_transaction.reversed':
          await this.handleSwapReversed(webhook.data);
          break;
        case 'swap_transaction.failed':
          await this.handleSwapFailed(webhook.data);
          break;
        case 'withdraw.successful':
          await this.handleWithdrawSuccessful(webhook.data);
          break;
        case 'withdraw.rejected':
          await this.handleWithdrawRejected(webhook.data);
          break;
        case 'order.done':
          await this.handleOrderDone(webhook.data);
          break;
        case 'order.cancelled':
          await this.handleOrderCancelled(webhook.data);
          break;
        case 'wallet.update':
          await this.handleWalletUpdate(webhook.data);
          break;
        default:
          logger.warn(`Unhandled webhook event: ${webhook.event}`);
      }

      await WebhookLogger.updateWebhookStatus(logId, 'processed');
    } catch (error) {
      logger.error('Webhook handling error:', error);
      await WebhookLogger.updateWebhookStatus(
        logId, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  private async findUserByEmail(email: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) throw error;
    if (!user) throw new Error(`User not found: ${email}`);
    return user;
  }

  private async createTransaction(data: {
    userId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    reference: string;
    description: string;
    payment_method: string;
  }) {
    const { error } = await supabase
      .from('transactions')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async updateTransaction(reference: string, status: TransactionStatus) {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('reference', reference);

    if (error) throw error;
  }

  private async handleInstantOrderDone(data: any) {
    try {
      const user = await this.findUserByEmail(data.user.email);
      await this.createTransaction({
        userId: user.id,
        type: TransactionType.BUY,
        status: TransactionStatus.COMPLETED,
        amount: parseFloat(data.total.amount),
        currency: data.total.unit.toUpperCase(),
        reference: data.id,
        description: `Instant order ${data.id}`,
        payment_method: 'quidax'
      });
    } catch (error) {
      logger.error('Error handling instant order:', error);
      throw error;
    }
  }

  private async handleInstantOrderCancelled(data: any) {
    await this.updateTransaction(data.id, TransactionStatus.FAILED);
  }

  private async handleInstantOrderFailed(data: any) {
    await this.updateTransaction(data.id, TransactionStatus.FAILED);
  }

  private async handleSwapReversed(data: any) {
    await this.updateTransaction(data.id, TransactionStatus.FAILED);
  }

  private async handleSwapFailed(data: any) {
    await this.updateTransaction(data.id, TransactionStatus.FAILED);
  }

  private async handleSwapCompleted(data: any) {
    try {
      const user = await this.findUserByEmail(data.user.email);
      await this.createTransaction({
        userId: user.id,
        type: TransactionType.SELL,
        status: TransactionStatus.COMPLETED,
        amount: parseFloat(data.from_amount),
        currency: data.from_currency.toUpperCase(),
        reference: data.id,
        description: `Swap transaction ${data.id}`,
        payment_method: 'quidax'
      });
    } catch (error) {
      logger.error('Error handling swap:', error);
      throw error;
    }
  }

  private async handleWithdrawSuccessful(data: any) {
    try {
      const user = await this.findUserByEmail(data.user.email);
      await this.createTransaction({
        userId: user.id,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
        amount: parseFloat(data.amount),
        currency: data.currency.toUpperCase(),
        reference: data.id,
        description: `Withdrawal ${data.id}`,
        payment_method: 'quidax'
      });
    } catch (error) {
      logger.error('Error handling withdrawal:', error);
      throw error;
    }
  }

  private async handleWithdrawRejected(data: any) {
    await this.updateTransaction(data.id, TransactionStatus.FAILED);
  }

  private async handleOrderDone(data: any) {
    try {
      const user = await this.findUserByEmail(data.user.email);
      await this.createTransaction({
        userId: user.id,
        type: TransactionType.BUY,
        status: TransactionStatus.COMPLETED,
        amount: parseFloat(data.origin_volume.amount),
        currency: data.origin_volume.unit.toUpperCase(),
        reference: data.id,
        description: `Order ${data.id}`,
        payment_method: 'quidax'
      });
    } catch (error) {
      logger.error('Error handling order:', error);
      throw error;
    }
  }

  private async handleOrderCancelled(data: any) {
    await this.updateTransaction(data.id, TransactionStatus.FAILED);
  }

  private async handleWalletUpdate(data: QuidaxWallet) {
    try {
      const { error } = await supabase
        .from('wallets')
        .upsert({
          user_id: data.id,
          currency: data.currency.toUpperCase(),
          balance: parseFloat(data.balance),
          pending_balance: parseFloat(data.locked),
          last_transaction_at: data.updated_at,
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,currency'
        });

      if (error) {
        logger.error('Error updating wallet:', error);
        throw error;
      }
    } catch (error) {
      logger.error('handleWalletUpdate error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const quidaxWebhookService = new QuidaxWebhookService();