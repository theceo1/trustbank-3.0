//app/lib/services/profile.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { generateReferralCode } from '@/utils/referral';

const supabase = createClientComponentClient();

export class ProfileService {
  static async createProfile(userId: string, email: string) {
    let referralCode = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Try to create profile with current referral code
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: userId,
              email,
              kyc_status: 'pending',
              kyc_level: 0,
              is_verified: false,
              daily_limit: 50000,
              monthly_limit: 1000000,
              referral_code: referralCode,
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
              }
            }
          ])
          .select()
          .single();

        if (error) {
          if (error.code === '23505' && error.message.includes('referral_code')) {
            // Generate a new code and try again
            referralCode = generateReferralCode();
            attempts++;
            continue;
          }
          throw error;
        }

        return data;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw new Error('Failed to create profile with unique referral code after multiple attempts');
        }
        attempts++;
        referralCode = generateReferralCode();
      }
    }

    throw new Error('Failed to create profile');
  }

  static async getProfile(userId: string) {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 