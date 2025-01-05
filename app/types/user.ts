export interface User {
  id: string;
  email: string;
  kyc_status: string;
  kyc_level: number;
  is_verified: boolean;
  daily_limit: number;
  monthly_limit: number;
  verification_status: {
    tier1_verified: boolean;
    tier2_verified: boolean;
    tier3_verified: boolean;
  };
  // Add any other user fields here
} 