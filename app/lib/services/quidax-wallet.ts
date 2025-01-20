import { QuidaxClient, QuidaxWallet, QuidaxResponse } from './quidax-client';

export class QuidaxWalletService {
  private client: QuidaxClient;

  constructor(apiKey: string) {
    this.client = new QuidaxClient(apiKey);
  }

  async getWallets(userId: string): Promise<QuidaxResponse<QuidaxWallet[]>> {
    return this.client.fetchUserWallets(userId);
  }

  async getWallet(userId: string, currency: string): Promise<QuidaxResponse<QuidaxWallet[]>> {
    return this.client.getWallet(userId, currency);
  }

  async getDepositAddress(userId: string, currency: string): Promise<QuidaxResponse<{ address: string; tag?: string }>> {
    return this.client.getDepositAddress(userId, currency);
  }
}

// Singleton instance for the wallet service
let walletService: QuidaxWalletService | null = null;

export function getWalletService(): QuidaxWalletService {
  if (!walletService) {
    const apiKey = process.env.QUIDAX_SECRET_KEY;
    if (!apiKey) {
      throw new Error('Quidax API key not configured');
    }
    walletService = new QuidaxWalletService(apiKey);
  }
  return walletService;
} 