import crypto from 'crypto';
import { prisma } from '@/app/lib/prisma';
import { logger } from '@/app/lib/logger';
import { 
  QuidaxWebhookEvent,
  QuidaxWalletUpdate,
  QuidaxInstantOrder,
  QuidaxDeposit,
  QuidaxSwapTransaction
} from '@/app/types/quidax';

export class QuidaxWebhookService {
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET || '';
  }

  verifySignature(payload: string, signature: string, timestamp: string): boolean {
    try {
      const computedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');
      
      return signature === computedSignature;
    } catch (error) {
      logger.error('Signature verification failed:', error);
      return false;
    }
  }

  async handleWebhook(event: string, data: any) {
    try {
      logger.info(`Processing webhook event: ${event}`);

      switch (event) {
        case 'wallet.updated':
          await this.handleWalletUpdated(data as QuidaxWalletUpdate);
          break;
        
        case 'instant_order.done':
          await this.handleInstantOrderDone(data as QuidaxInstantOrder);
          break;
        
        case 'deposit.successful':
          await this.handleDepositSuccessful(data as QuidaxDeposit);
          break;
        
        case 'swap_transaction.completed':
          await this.handleSwapCompleted(data as QuidaxSwapTransaction);
          break;

        default:
          logger.warn(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      logger.error(`Error processing webhook event ${event}:`, error);
      throw error;
    }
  }

  private async handleWalletUpdated(data: QuidaxWalletUpdate) {
    try {
      logger.info(`Updating wallet for user ${data.user.email}`);

      const user = await prisma.user.findFirst({
        where: {
          email: data.user.email
        }
      });

      if (!user) {
        throw new Error(`User not found: ${data.user.email}`);
      }

      await prisma.wallet.upsert({
        where: {
          userId_currency: {
            userId: user.id,
            currency: data.currency.toUpperCase()
          }
        },
        create: {
          userId: user.id,
          currency: data.currency.toUpperCase(),
          balance: parseFloat(data.balance),
          locked: parseFloat(data.locked),
          provider: 'QUIDAX',
          address: data.deposit_address,
          metadata: {
            providerWalletId: data.id,
            is_crypto: data.is_crypto,
            reference_currency: data.reference_currency
          }
        },
        update: {
          balance: parseFloat(data.balance),
          locked: parseFloat(data.locked),
          updatedAt: new Date()
        }
      });

      logger.info(`Wallet updated successfully for user ${data.user.email}`);
    } catch (error) {
      logger.error('Error handling wallet update:', error);
      throw error;
    }
  }

  private async handleInstantOrderDone(data: QuidaxInstantOrder) {
    try {
      logger.info(`Processing instant order ${data.id}`);

      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) {
        throw new Error(`User not found: ${data.user.email}`);
      }

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'EXCHANGE',
          status: 'COMPLETED',
          amount: parseFloat(data.total.amount),
          currency: data.total.unit.toUpperCase(),
          provider: 'QUIDAX',
          providerTransactionId: data.id,
          metadata: {
            market: data.market,
            side: data.side,
            price: data.price,
            volume: data.volume,
            fee: data.fee
          }
        }
      });

      logger.info(`Instant order ${data.id} processed successfully`);
    } catch (error) {
      logger.error('Error handling instant order:', error);
      throw error;
    }
  }

  private async handleDepositSuccessful(data: QuidaxDeposit) {
    try {
      logger.info(`Processing deposit ${data.id}`);

      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) {
        throw new Error(`User not found: ${data.user.email}`);
      }

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: parseFloat(data.amount),
          currency: data.currency.toUpperCase(),
          provider: 'QUIDAX',
          providerTransactionId: data.id,
          metadata: {
            txid: data.txid,
            fee: data.fee
          }
        }
      });

      logger.info(`Deposit ${data.id} processed successfully`);
    } catch (error) {
      logger.error('Error handling deposit:', error);
      throw error;
    }
  }

  private async handleSwapCompleted(data: QuidaxSwapTransaction) {
    try {
      logger.info(`Processing swap transaction ${data.id}`);

      const user = await prisma.user.findFirst({
        where: { email: data.user.email }
      });

      if (!user) {
        throw new Error(`User not found: ${data.user.email}`);
      }

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'SWAP',
          status: 'COMPLETED',
          amount: parseFloat(data.from_amount),
          currency: data.from_currency.toUpperCase(),
          provider: 'QUIDAX',
          providerTransactionId: data.id,
          metadata: {
            toCurrency: data.to_currency,
            receivedAmount: data.received_amount,
            executionPrice: data.execution_price,
            quotation: data.swap_quotation
          }
        }
      });

      logger.info(`Swap transaction ${data.id} processed successfully`);
    } catch (error) {
      logger.error('Error handling swap:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const quidaxWebhookService = new QuidaxWebhookService();