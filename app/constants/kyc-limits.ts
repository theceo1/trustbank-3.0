// app/constants/kyc-limits.ts
import { KYCTier } from '@/app/types/kyc';

export const KYC_LIMITS = {
  [KYCTier.NONE]: {
    dailyLimit: 0,
    monthlyLimit: 0,
  },
  [KYCTier.BASIC]: {
    dailyLimit: 50000,
    monthlyLimit: 1000000,
  },
  [KYCTier.INTERMEDIATE]: {
    dailyLimit: 200000,
    monthlyLimit: 5000000,
  },
  [KYCTier.ADVANCED]: {
    dailyLimit: 1000000,
    monthlyLimit: 20000000,
  },
}; 