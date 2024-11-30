import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

export class ProfileService {
  private static supabase = createClientComponentClient<Database>();

  static async getProfile(userId: string) {
    try {
      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!profile) {
        const { data: newProfile, error: createError } = await this.supabase
          .from('user_profiles')
          .insert([{
            user_id: userId,
            kyc_status: 'unverified',
            kyc_level: 0,
            trading_limit: 0
          }])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile;
      }

      return profile;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
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