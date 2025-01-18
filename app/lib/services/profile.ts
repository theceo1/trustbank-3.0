//app/lib/services/profile.ts

import { createClient } from '@supabase/supabase-js';
import { generateReferralCode } from '../../utils/referral';
import { QuidaxService } from './quidax';
import { getAdminClient } from '../supabase/client';

export class ProfileService {
  static async createProfile(userId: string, email: string) {
    const supabase = getAdminClient();
    
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw userError;

    // Check if profile already exists
    const { data: existingProfile, error: existingError } = await supabase
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

    // Create unique email for Quidax account
    const uniqueEmail = `${email.split('@')[0]}.${Date.now()}@trustbank.tech`;

    // Create Quidax sub-account with unique email
    const quidaxUser = await QuidaxService.createSubAccount({
      email: uniqueEmail,
      first_name: firstName,
      last_name: lastName || firstName,
      phone: '+2348000000000' // Add default phone number
    });

    if (!quidaxUser?.id) {
      throw new Error('Failed to create Quidax account');
    }

    // Generate unique referral code
    const referralCode = generateReferralCode();

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          email,
          full_name: fullName,
          quidax_id: quidaxUser.id,
          referral_code: referralCode,
          kyc_status: 'pending',
          kyc_level: 0,
          tier1_verified: false,
          tier2_verified: false,
          tier3_verified: false
        }
      ])
      .select()
      .single();

    if (profileError) throw profileError;
    return profile;
  }

  static async getProfile(userId: string) {
    const supabase = getAdminClient();
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
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (user) {
          return this.createProfile(userId, user.email!);
        }
      }
      throw error;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: any) {
    const supabase = getAdminClient();
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