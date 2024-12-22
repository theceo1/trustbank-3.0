import { KYCService } from './kyc';
import { TransactionLimitService } from './transactionLimits';
import { KYCTier } from '@/app/types/kyc';

export class TradeValidationService {
  static async validateTrade(userId: string, amount: number) {
    try {
      // Check KYC status
      const kycStatus = await KYCService.getKYCStatus(userId);
      
      if (!kycStatus.isVerified || kycStatus.tier === KYCTier.NONE) {
        return {
          valid: false,
          reason: 'Please complete KYC verification to trade'
        };
      }

      // Check if amount exceeds tier limits
      if (amount > kycStatus.limits.dailyLimit) {
        return {
          valid: false,
          reason: `Amount exceeds your daily limit of ₦${kycStatus.limits.dailyLimit.toLocaleString()}`
        };
      }

      // Validate transaction limits
      const limitValidation = await TransactionLimitService.validateTradeAmount(
        userId,
        amount
      );

      if (!limitValidation.valid) {
        return limitValidation;
      }

      return { valid: true };
    } catch (error) {
      console.error('Trade validation failed:', error);
      return {
        valid: false,
        reason: 'Trade validation failed'
      };
    }
  }
}