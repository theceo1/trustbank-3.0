//types/index.ts
import { Session, User } from "@supabase/supabase-js";
import { KYCInfo } from "@/app/types/kyc";

export interface UserProfile {
    user_id: string;
    email: string;
    name?: string;
    referral_code: string;
    created_at: string;
  }

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  kycInfo?: KYCInfo;
  signUp: (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ data: { provider: string; url: string | null } | null; error: Error | null }>;
  getToken: () => Promise<string>;
}
