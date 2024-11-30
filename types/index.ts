import { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
    user_id: string;
    email: string;
    name?: string;
    referral_code: string;
    created_at: string;
  }

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{
    data: { url: string; provider: string } | null;
    error: Error | null;
  }>;
  logout: () => Promise<void>;
}
