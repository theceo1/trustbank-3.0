import { prisma } from '@/app/lib/prisma';
import { logger } from '@/app/lib/logger';
import { transaction_type, transaction_status } from '@prisma/client';

type WebhookEvent = {
  event: string;
  data: any;
}

export class QuidaxWebhookService {
  async handleWebhook(webhook: WebhookEvent) {
    try {
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
        default:
          logger.warn(`Unhandled webhook event: ${webhook.event}`);
      }
    } catch (error) {
      logger.error('Webhook handling error:', error);
      throw error;
    }
  }

  private async handleInstantOrderDone(data: any) {
    try {
      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) throw new Error(`User not found: ${data.user.email}`);

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: transaction_type.buy,
          status: transaction_status.completed,
          amount: parseFloat(data.total.amount),
          currency: data.total.unit.toUpperCase(),
          reference: data.id,
          description: `Instant order ${data.id}`,
          payment_method: 'quidax'
        }
      });
    } catch (error) {
      logger.error('Error handling instant order:', error);
      throw error;
    }
  }

  private async handleInstantOrderCancelled(data: any) {
    await this.updateTransaction(data.id, transaction_status.failed, data);
  }

  private async handleInstantOrderFailed(data: any) {
    await this.updateTransaction(data.id, transaction_status.failed, data);
  }

  private async handleSwapReversed(data: any) {
    await this.updateTransaction(data.id, transaction_status.failed, data);
  }

  private async handleSwapFailed(data: any) {
    await this.updateTransaction(data.id, transaction_status.failed, data);
  }

  private async handleSwapCompleted(data: any) {
    try {
      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) throw new Error(`User not found: ${data.user.email}`);

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: transaction_type.sell,
          status: transaction_status.completed,
          amount: parseFloat(data.from_amount),
          currency: data.from_currency.toUpperCase(),
          reference: data.id,
          description: `Swap transaction ${data.id}`,
          payment_method: 'quidax'
        }
      });
    } catch (error) {
      logger.error('Error handling swap:', error);
      throw error;
    }
  }

  private async handleWithdrawSuccessful(data: any) {
    try {
      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) throw new Error(`User not found: ${data.user.email}`);

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: transaction_type.withdrawal,
          status: transaction_status.completed,
          amount: parseFloat(data.amount),
          currency: data.currency.toUpperCase(),
          reference: data.id,
          description: `Withdrawal ${data.id}`,
          payment_method: 'quidax'
        }
      });
    } catch (error) {
      logger.error('Error handling withdrawal:', error);
      throw error;
    }
  }

  private async handleWithdrawRejected(data: any) {
    await this.updateTransaction(data.id, transaction_status.failed, data);
  }

  private async handleOrderDone(data: any) {
    try {
      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) throw new Error(`User not found: ${data.user.email}`);

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: transaction_type.buy,
          status: transaction_status.completed,
          amount: parseFloat(data.origin_volume.amount),
          currency: data.origin_volume.unit.toUpperCase(),
          reference: data.id,
          description: `Order ${data.id}`,
          payment_method: 'quidax'
        }
      });
    } catch (error) {
      logger.error('Error handling order:', error);
      throw error;
    }
  }

  private async handleOrderCancelled(data: any) {
    await this.updateTransaction(data.id, transaction_status.failed, data);
  }

  private async updateTransaction(transactionId: string, status: transaction_status, data: any) {
    try {
      await prisma.transaction.updateMany({
        where: { reference: transactionId },
        data: { status }
      });
    } catch (error) {
      logger.error('Error updating transaction:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const quidaxWebhookService = new QuidaxWebhookService();