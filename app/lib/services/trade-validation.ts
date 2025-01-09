import { KYCService } from './kyc';
import { KYCTier, KYC_LIMITS } from '@/app/types/kyc';

export class TradeValidationService {
  static async validateTradeAmount(userId: string, amount: number): Promise<boolean> {
    try {
      const kycStatus = await KYCService.getKYCStatus(userId);
      const limits = KYC_LIMITS[kycStatus.tier];

      if (!limits) {
        throw new Error('Invalid KYC tier');
      }

      // Check if amount exceeds daily limit
      if (amount > limits.dailyLimit) {
        throw new Error(`Amount exceeds daily limit of ${limits.dailyLimit}`);
      }

      // Check if amount exceeds monthly limit
      if (amount > limits.monthlyLimit) {
        throw new Error(`Amount exceeds monthly limit of ${limits.monthlyLimit}`);
      }

      return true;
    } catch (error) {
      console.error('Trade validation failed:', error);
      throw error;
    }
  }
}