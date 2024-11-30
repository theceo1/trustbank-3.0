export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
      Tables: {
        user_profiles: {
          Row: {
            id: string;
            full_name: string | null;
            phone_number: string | null;
            kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
            kyc_level: number;
            trading_limit: number;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id: string;
            full_name?: string | null;
            phone_number?: string | null;
            kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
            kyc_level?: number;
            trading_limit?: number;
          };
          Update: {
            full_name?: string | null;
            phone_number?: string | null;
            kyc_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
            kyc_level?: number;
            trading_limit?: number;
          };
        };
        account_settings: {
          Row: {
            id: string;
            user_id: string;
            two_factor_enabled: boolean;
            language: string;
            currency: string;
            notifications: {
              push: boolean;
              email: boolean;
              trades: boolean;
              marketing: boolean;
            };
            privacy: {
              show_balance: boolean;
              activity_status: boolean;
              profile_visible: boolean;
            };
            created_at: string;
            updated_at: string;
          };
          Insert: Omit<Database['public']['Tables']['account_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<Database['public']['Tables']['account_settings']['Row'], 'id'>>;
        };
        trades: {
          Row: {
            id: string;
            user_id: string;
            type: 'buy' | 'sell';
            currency: string;
            amount: number;
            rate: number;
            total: number;
            quidax_fee: number;
            platform_fee: number;
            status: 'pending' | 'processing' | 'completed' | 'failed';
            payment_method: string;
            payment_url: string | null;
            quidax_reference: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: Omit<Database['public']['Tables']['trades']['Row'], 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Database['public']['Tables']['trades']['Insert']>;
        };
      };
    };
  }