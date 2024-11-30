// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          is_verified: boolean
          referral_code: string | null
          referred_by: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          email?: string | null
        }
        Update: {
          full_name?: string | null
          is_verified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          email?: string | null
        }
      }
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          total_deposits: number;
          total_withdrawals: number;
          pending_balance: number;
          currency: string;
          last_transaction_at: string;
          created_at: string;
          updated_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          currency: string;
          description?: string;
          payment_method?: string;
          reference?: string;
          external_id?: string;
          fiat_amount?: number;
          fiat_currency?: string;
          crypto_amount?: number;
          crypto_currency?: string;
          rate?: number;
          payment_reference?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Row']>;
      };
      kyc_verifications: {
        Row: {
          id: string;
          user_id: string | null;
          status: 'pending' | 'verified' | 'rejected' | 'unverified' | null;
          level: number | null;
          created_at: string;
          updated_at: string;
          verification_type: string | null;
          verification_id: string | null;
          verification_data: Json | null;
          verified_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['kyc_verifications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['kyc_verifications']['Row']>;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
      };
      admin_users: {
        Row: {
          id: string
          user_id: string
          is_active: boolean
          role: {
            name: string
            permissions: Record<string, string[]>
          }[]
        }
        Insert: {
          id?: string
          user_id: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          is_active?: boolean
        }
      }
    }
  }
}
