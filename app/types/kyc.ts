export type KYCStatusType = 'verified' | 'pending' | 'rejected' | 'unverified';

export interface KYCEligibility {
  eligible: boolean;
  status: KYCStatusType;
  reason?: string;
}

export interface KYCVerification {
  id: string;
  user_id: string | null;
  status: KYCStatusType | null;
  level: number | null;
  verification_type: string | null;
  verification_id: string | null;
  verification_data: Record<string, any> | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  status: KYCStatusType;
  verification_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface KYCLevel {
  level: number;
  name: string;
  daily_limit: number;
  monthly_limit: number;
  requirements: string[];
  verification_types: string[];
  max_transaction_amount: number;
}

export type KYCTier = 'unverified' | 'tier1' | 'tier2' | 'tier3';

export interface KYCInfo {
  currentTier: 'unverified' | 'tier1' | 'tier2' | 'tier3';
  status: 'pending' | 'approved' | 'rejected';
  documents?: {
    nin?: string;
    bvn?: string;
    international_passport?: string;
    drivers_license?: string;
  };
}