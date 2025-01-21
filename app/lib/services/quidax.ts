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
} 