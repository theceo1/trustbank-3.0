//scripts/services/test-quidax.ts

import { SwapService } from '../../app/lib/services/swap';
import { WalletService } from '../../app/lib/services/wallet';
import { QuidaxService } from '../../app/lib/services/quidax';


export class TestQuidaxService {
  static async getWalletBalance(currency: string) {
    const walletInfo = await QuidaxService.getWalletInfo('me');
    return walletInfo[currency.toLowerCase()];
  }

  static async createInstantSwap(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    const quotation = await SwapService.createQuotation({
      userId: params.user_id,
      fromCurrency: params.from_currency,
      toCurrency: params.to_currency,
      fromAmount: params.from_amount
    });

    const confirmation = await SwapService.confirmQuotation({
      userId: params.user_id,
      quotationId: quotation.id
    });

    return { quotation, confirmation };
  }

  static async checkWalletBalance(userId: string, currency: string) {
    const walletInfo = await QuidaxService.getWalletInfo(userId);
    return walletInfo[currency.toLowerCase()];
  }

  static async getSwapTransactions(userId: string) {
    return SwapService.getAllTransactions(userId);
  }

  static async getSwapTransaction(userId: string, swapTransactionId: string) {
    return SwapService.getTransaction(userId, swapTransactionId);
  }

  static async getDepositAddress(userId: string, currency: string) {
    return WalletService.getWalletAddress(userId, currency);
  }
}