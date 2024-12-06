import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export class ProfileService {
  private static supabase = createClientComponentClient<Database>();

  static async getProfile(userId: string) {
    try {
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          full_name,
          quidax_id,
          is_verified,
          kyc_verified,
          kyc_tier,
          daily_limit,
          monthly_limit,
          referral_code,
          documents
        `)
        .eq('user_id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          const { data: { user } } = await this.supabase.auth.getUser();
          return this.createInitialProfile(userId, user?.user_metadata?.name || '');
        }
        throw profileError;
      }

      return profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  private static async createInitialProfile(userId: string, fullName: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          full_name: fullName,
          kyc_verified: false,
          kyc_tier: 'unverified',
          daily_limit: 0,
          monthly_limit: 0,
          documents: {},
          is_test: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profile creation error:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 