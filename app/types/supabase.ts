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
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          quidax_id: string | null
          kyc_level: number
          is_verified: boolean
          kyc_status: 'pending' | 'verified' | 'rejected'
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          two_factor_enabled: boolean
          phone: string | null
          country: string | null
          referral_code: string
          referral_stats: {
            totalReferrals: number
            activeReferrals: number
            totalEarnings: number
            pendingEarnings: number
          }
          api_keys: Array<{
            id: string
            name: string
            key: string
            created_at: string
            last_used?: string
            permissions: {
              read: boolean
              trade: boolean
              withdraw: boolean
            }
          }>
          notification_settings: {
            email: {
              marketing: boolean
              security: boolean
              trading: boolean
              news: boolean
            }
            push: {
              trading: boolean
              security: boolean
              price_alerts: boolean
            }
            sms: {
              security: boolean
              trading: boolean
            }
          }
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          quidax_id?: string | null
          kyc_level?: number
          is_verified?: boolean
          kyc_status?: 'pending' | 'verified' | 'rejected'
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          two_factor_enabled?: boolean
          phone?: string | null
          country?: string | null
          referral_code?: string
          referral_stats?: {
            totalReferrals: number
            activeReferrals: number
            totalEarnings: number
            pendingEarnings: number
          }
          api_keys?: Array<{
            id: string
            name: string
            key: string
            created_at: string
            last_used?: string
            permissions: {
              read: boolean
              trade: boolean
              withdraw: boolean
            }
          }>
          notification_settings?: {
            email: {
              marketing: boolean
              security: boolean
              trading: boolean
              news: boolean
            }
            push: {
              trading: boolean
              security: boolean
              price_alerts: boolean
            }
            sms: {
              security: boolean
              trading: boolean
            }
          }
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      admin_profiles: {
        Row: {
          id: string
          user_id: string
          role: string
          permissions: {
            users: string[]
            trades: string[]
            settings: string[]
            reports: string[]
            kyc: string[]
          }
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          permissions: {
            users: string[]
            trades: string[]
            settings: string[]
            reports: string[]
            kyc: string[]
          }
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_profiles']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
