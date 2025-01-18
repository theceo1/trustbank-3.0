//app/lib/services/profile.ts

import { createClient } from '@supabase/supabase-js';
import { generateReferralCode } from '../../utils/referral';

let supabase: ReturnType<typeof createClient>;

function getClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export class ProfileService {
  static async createProfile(userId: string, email: string) {
    // Get user metadata from auth.users
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError) throw userError;

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await getClient()
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') { // Not found error is ok
      throw existingError;
    }

    if (existingProfile) {
      return existingProfile;
    }

    // Extract user metadata
    const metadata = user?.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || email.split('@')[0];
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    // Generate unique referral code
    const referralCode = generateReferralCode();

    // Create new profile with consistent schema
    const { data: profile, error: createError } = await getClient()
      .from('user_profiles')
      .upsert([
        {
          user_id: userId,
          email,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName || null,
          phone: metadata.phone || null,
          kyc_status: 'pending',
          kyc_level: 0,
          is_verified: false,
          daily_limit: 50000,
          monthly_limit: 1000000,
          avatar_url: metadata.avatar_url || null,
          country: metadata.country || 'NG',
          referral_code: referralCode,
          verification_status: {
            email: !!user?.email_confirmed_at,
            phone: !!metadata.phone_verified,
            identity: false,
            address: false
          },
          referral_stats: {
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarnings: 0,
            pendingEarnings: 0
          },
          notification_settings: {
            email: { marketing: false, security: true, trading: true, news: false },
            push: { trading: true, security: true, price_alerts: true },
            sms: { security: true, trading: true }
          },
          created_at: user?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }

    return profile;
  }

  static async getProfile(userId: string) {
    const { data, error } = await getClient()
      .from('user_profiles')
      .select(`
        *,
        verification_status,
        referral_code,
        referral_stats,
        api_keys,
        notification_settings
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: { user } } = await getClient().auth.admin.getUserById(userId);
        if (user) {
          return this.createProfile(userId, user.email!);
        }
      }
      throw error;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: any) {
    const { data, error } = await getClient()
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}