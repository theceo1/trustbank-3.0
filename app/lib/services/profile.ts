//app/lib/services/profile.ts

import { createClient } from '@supabase/supabase-js';
import { QuidaxClient } from './quidax-client';
import { generateReferralCode } from '@/app/utils/referral';

export class ProfileService {
  private static getClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  private static getQuidaxClient() {
    if (!process.env.QUIDAX_SECRET_KEY) {
      throw new Error('Quidax API key not configured');
    }
    return new QuidaxClient(process.env.QUIDAX_SECRET_KEY);
  }

  static async createProfile(userId: string, email: string) {
    if (!process.env.QUIDAX_SECRET_KEY) {
      throw new Error('Quidax API key not configured');
    }

    console.log('Creating profile for user:', { userId, email });
    const supabase = this.getClient();

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    if (existingProfile) {
      console.log('Found existing profile:', existingProfile);
      // If profile exists but no quidax_id, try to create one
      if (!existingProfile.quidax_id) {
        try {
          const fullName = email.split('@')[0];
          const uniqueEmail = `${email.split('@')[0]}.${Date.now()}@trustbank.tech`;
          
          console.log('Creating Quidax sub-account for existing profile:', { fullName, uniqueEmail });
          const quidaxClient = this.getQuidaxClient();
          const quidaxResponse = await quidaxClient.createSubAccount({
            email: uniqueEmail,
            first_name: fullName,
            last_name: fullName,
            country: 'ng'  // Use lowercase ISO country code
          });

          console.log('Quidax sub-account created:', quidaxResponse);

          if (!quidaxResponse?.data?.id) {
            throw new Error('Failed to create Quidax account: No ID returned');
          }

          const { data: updatedProfile, error: updateError } = await supabase
            .from('user_profiles')
            .update({ 
              quidax_id: quidaxResponse.data.id,
              metadata: {
                quidax: {
                  quidax_email: uniqueEmail,
                  user_email: email
                }
              }
            })
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to update profile with Quidax ID:', updateError);
            throw updateError;
          }

          console.log('Profile updated with Quidax ID:', updatedProfile);
          return updatedProfile;
        } catch (error) {
          console.error('Failed to create Quidax account for existing profile:', error);
          throw error;
        }
      }
      return existingProfile;
    }

    try {
      // Create unique email for Quidax account
      const fullName = email.split('@')[0];
      const uniqueEmail = `${email.split('@')[0]}.${Date.now()}@trustbank.tech`;
      
      console.log('Creating Quidax sub-account for new profile:', { fullName, uniqueEmail });
      // Create Quidax sub-account
      const quidaxClient = this.getQuidaxClient();
      const quidaxResponse = await quidaxClient.createSubAccount({
        email: uniqueEmail,
        first_name: fullName,
        last_name: fullName,
        country: 'ng'  // Use lowercase ISO country code
      });

      console.log('Quidax sub-account created:', quidaxResponse);

      if (!quidaxResponse?.data?.id) {
        throw new Error('Failed to create Quidax account: No ID returned');
      }

      // Generate unique referral code
      const referralCode = generateReferralCode();

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: userId,
          email,
          full_name: fullName,
          quidax_id: quidaxResponse.data.id,
          referral_code: referralCode,
          kyc_status: 'pending',
          kyc_level: 0,
          tier1_verified: false,
          tier2_verified: false,
          tier3_verified: false,
          daily_limit: 50000,
          monthly_limit: 1000000,
          metadata: {
            quidax: {
              quidax_email: uniqueEmail,
              user_email: email
            }
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
          }
        }])
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  static async getProfile(userId: string) {
    const supabase = this.getClient();
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

    if (error) {
      // If profile doesn't exist, throw error
      throw error;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: any) {
    const supabase = this.getClient();
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