import { TradeDetails } from '@/app/types/trade';
import { QuidaxService } from './quidax';

export class BankService {
  static async generateTransferDetails(trade: TradeDetails) {
    const response = await QuidaxService.initializeBankTransfer({
      amount: trade.amount,
      currency: trade.currency,
      reference: trade.reference
    });

    return {
      accountNumber: response.account_number,
      accountName: response.account_name,
      bankName: response.bank_name,
      reference: response.reference
    };
  }
}