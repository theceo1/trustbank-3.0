export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  kyc_status?: 'unverified' | 'pending' | 'verified' | 'failed';
  kyc_level?: number;
  kyc_data?: {
    nin?: string;
    bvn?: string;
    photo_id?: string;
    verification_id?: string;
  };
  created_at?: string;
  updated_at?: string;
} 