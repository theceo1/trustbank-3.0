// This script creates a test user with a specific email and password
// It also sets the user's KYC level to 2, which is required for trading
// scripts/create-test-user.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';
import { TestQuidaxService } from './services/test-quidax';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateReferralCode(length = 8): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

async function createTestUser() {
  try {
    // Create user in auth with auto-confirm
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email: 'user2@trustbank.tech',
      password: 'SecureUserPass123!',
      email_confirm: true // This automatically confirms the email
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('User creation failed');

    console.log('Auth user created:', user.id);

    // Create user profile with KYC level
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: 'user2@trustbank.tech',
        first_name: 'Test',
        last_name: 'User',
        kyc_level: 2,
        kyc_status: 'approved',
        is_verified: true
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Create user_profile entry with referral code
    const referralCode = generateReferralCode();
    const { error: userProfileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        kyc_tier: 'tier2',
        daily_limit: 1000000, // Based on your KYC_TIERS constant
        monthly_limit: 50000000,
        kyc_verified: true,
        documents: {
          nin: 'verified',
          bvn: 'verified'
        }
      });

    if (userProfileError) throw userProfileError;

    // After creating the user profile, before creating the wallet
    // Create Quidax sub-account
    const quidaxUser = await TestQuidaxService.createSubAccount({
      email: 'user2@trustbank.tech',
      first_name: 'Test',
      last_name: 'User'
    });

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        quidax_id: quidaxUser.id
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Create wallets for all supported currencies
    const currencies = ['ngn', 'btc', 'eth', 'usdt', 'usdc'];

    for (const currency of currencies) {
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          currency: currency.toUpperCase(),
          balance: currency === 'NGN' ? 1000000 : 0, // Only NGN gets initial balance
          is_test: true,
          quidax_wallet_id: quidaxUser.id
        });

      if (walletError) throw walletError;
    }

    console.log('Test user created successfully:', {
      ...userProfile,
      referral_code: referralCode,
      wallets: currencies.map(currency => ({
        currency: currency.toUpperCase(),
        balance: currency === 'NGN' ? 1000000 : 0
      }))
    });
    return userProfile;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 