import { QuidaxClient, CreateSubAccountParams } from './quidax-client';
import { QuidaxWalletService, getWalletService } from './quidax-wallet';
import { QuidaxSwapService } from './quidax-swap';

// Re-export the consolidated Quidax implementation
export { QuidaxClient } from './quidax-client';
export { QuidaxWalletService, getWalletService } from './quidax-wallet';
export { QuidaxSwapService } from './quidax-swap';

// Re-export types
export type {
  QuidaxUser,
  QuidaxWallet,
  QuidaxResponse,
  SwapQuotation,
  SwapResponse,
  CreateSubAccountParams
} from './quidax-client';

// Error class
export class QuidaxError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'QuidaxError';
  }
}

// Facade for static methods (for backward compatibility)
export class QuidaxService {
  private static walletService = getWalletService();

  static async createSubAccount(data: CreateSubAccountParams) {
    const client = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');
    return client.createSubAccount(data);
  }

  static async getUser(userId: string) {
    const client = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');
    return client.getUser(userId);
  }

  static async getWallets(userId: string) {
    return this.walletService.getWallets(userId);
  }

  static async getWallet(userId: string, currency: string) {
    return this.walletService.getWallet(userId, currency);
  }

  static async getDepositAddress(userId: string, currency: string) {
    console.log('Getting deposit address for user:', userId, 'currency:', currency);
    const response = await this.walletService.getDepositAddress(userId, currency);
    console.log('Deposit address response:', response);
    return response;
  }

  static async createSwapQuotation(params: any) {
    return QuidaxSwapService.createSwapQuotation(params);
  }

  static async confirmSwap(params: any) {
    return QuidaxSwapService.confirmSwap(params.userId, params.quotationId);
  }

  static async transfer(senderId: string, receiverId: string, amount: string, currency: string) {
    const client = new QuidaxClient(process.env.QUIDAX_SECRET_KEY || '');
    return client.transfer(senderId, receiverId, currency, amount);
  }

  static verifyWebhookSignature(webhook: any, signature?: string): boolean {
    if (!signature) {
      // If no signature is provided, we'll skip verification in development
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      return false;
    }

    try {
      // TODO: Implement actual signature verification logic using the Quidax webhook secret
      // This should use crypto to verify HMAC signature
      // For now, we'll return true in development and require proper implementation in production
      if (process.env.NODE_ENV === 'development') {
        return true;
      }
      
      // In production, we should verify the signature
      const webhookSecret = process.env.QUIDAX_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('QUIDAX_WEBHOOK_SECRET is not configured');
        return false;
      }

      // TODO: Implement proper signature verification
      // const hmac = crypto.createHmac('sha256', webhookSecret);
      // const calculatedSignature = hmac.update(JSON.stringify(webhook)).digest('hex');
      // return calculatedSignature === signature;

      return true; // Temporary return until proper verification is implemented
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  static mapQuidaxStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'completed';
      case 'failed':
      case 'rejected':
        return 'failed';
      case 'processing':
      case 'confirming':
        return 'processing';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
} 