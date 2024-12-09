// This script creates a test user with a specific email and password
// It also sets the user's KYC level to 2, which is required for trading
// scripts/create-test-user.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Setup debug loggers
const log = debug('setup:test-user');
const authLog = debug('setup:auth');
const dbLog = debug('setup:db');

// Enable logging
debug.enable('setup:*');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createTestUser() {
  const testEmail = 'user2@trustbank.tech';
  
  try {
    console.log('🚀 Starting test user creation...');
    console.log('Environment check:', {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
      SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'
    });

    // First verify if user exists and delete
    authLog('Checking for existing user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list users:', listError);
      throw listError;
    }

    const existingUser = users.find(u => u.email === testEmail);
    if (existingUser) {
      authLog('🔄 Found existing user, deleting...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      if (deleteError) {
        console.error('❌ Failed to delete existing user:', deleteError);
        throw deleteError;
      }
      authLog('✅ Existing user deleted');
      // Wait for deletion to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Create user in auth with auto-confirm
    authLog('🔑 Creating auth user...');
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'SecureUserPass123!'
    });

    if (signUpError) {
      console.error('❌ Auth user creation failed:', {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code
      });
      throw signUpError;
    }
    if (!user) throw new Error('User creation returned null');

    authLog('✅ Auth user created:', user.id);

    // Create user profile
    console.log('👤 Creating user profile...');
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        is_verified: true,
        kyc_level: 2,
        kyc_status: 'approved'
      });

    if (userError) throw userError;
    console.log('✅ User profile created');

    // Create user_profile entry with more details
    console.log('🏷️ Creating user profile details...');
    const referralCode = generateReferralCode();
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        kyc_tier: 'tier2',
        daily_limit: 1000000,
        monthly_limit: 50000000,
        kyc_verified: true,
        documents: {
          nin: 'verified',
          bvn: 'verified'
        }
      });

    if (profileError) throw profileError;
    console.log('✅ User profile details created');

    // Create default wallets
    console.log('💰 Creating wallets...');
    const currencies = ['ngn', 'btc', 'eth', 'usdt', 'usdc'];
    for (const currency of currencies) {
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          currency: currency.toUpperCase(),
          balance: currency.toLowerCase() === 'ngn' ? 1000000 : 0,
          is_test: true
        });

      if (walletError) throw walletError;
      console.log(`✅ ${currency.toUpperCase()} wallet created`);
    }

    console.log('\n✨ Test user setup completed successfully');
    console.log('Login credentials:');
    console.log('Email:', testEmail);
    console.log('Password: SecureUserPass123!');

  } catch (error: any) {
    console.error('\n❌ Test user creation failed');
    console.error('Error details:', {
      message: error.message,
      status: error?.status,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    });
    process.exit(1);
  }
}

// Run with debug output
createTestUser(); 