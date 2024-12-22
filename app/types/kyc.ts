// app/types/kyc.ts
export enum KYCTier {
  NONE = 0,
  BASIC = 1,    // NIN verification
  INTERMEDIATE = 2,  // BVN verification
  ADVANCED = 3   // Photo ID + Selfie verification
}

export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'unverified';
export type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export interface KYCVerification {
  verification_type: 'nin' | 'bvn' | 'photo_id';
  status: KYCStatus;
  verification_data: any;
  attempt_count: number;
  last_attempt_at: string;
}

export interface KYCInfo {
  currentTier: KYCTier;
  status: KYCStatus;
  documents: Record<string, any>;
}

export interface KYCEligibility {
  eligible: boolean;
  status: KYCStatus;
  reason: string;
}

export interface KYCTierInfo {
  tier: KYCTier;
  title: string;
  description: string;
  requirements: string[];
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
  };
  route: string;
  completed: boolean;
}

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