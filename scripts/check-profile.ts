import { createClient } from '@supabase/supabase-js';
import * as dotenvLib from 'dotenv';
import type { User } from '@supabase/supabase-js';

dotenvLib.config({ path: '.env.local' });

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkProfile() {
  try {
    // Get user from auth.users
    const { data: { users }, error: authError } = await supabaseClient.auth.admin.listUsers();
    if (authError) {
      console.error('Failed to list users:', authError);
      return;
    }

    const user = users.find((u: User) => u.email === 'test1735848851306@trustbank.tech');
    if (!user) {
      console.error('User not found in auth.users');
      return;
    }

    console.log('\nAuth User Data:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      user_metadata: user.user_metadata
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      return;
    }

    console.log('\nUser Profile:', {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      kyc_status: profile.kyc_status,
      kyc_level: profile.kyc_level,
      is_verified: profile.is_verified,
      quidax_id: profile.quidax_id,
      referral_code: profile.referral_code,
      daily_limit: profile.daily_limit,
      monthly_limit: profile.monthly_limit,
      created_at: profile.created_at
    });

    // Check if user has a wallet
    if (profile.quidax_id) {
      const { data: wallet, error: walletError } = await supabaseClient
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) {
        console.error('Failed to fetch wallet:', walletError);
      } else {
        console.log('\nWallet Data:', wallet);
      }
    } else {
      console.log('\nNo quidax_id found - wallet not set up');
    }

    // Check verification status
    const { data: verification, error: verificationError } = await supabaseClient
      .from('verification_status')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (verificationError) {
      console.log('\nNo verification status found');
    } else {
      console.log('\nVerification Status:', verification);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProfile().catch(console.error); 