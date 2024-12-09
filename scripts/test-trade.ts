//scripts/test-trade.ts

import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { QuidaxService } from '../app/lib/services/quidax';
import { TestQuidaxService } from './services/test-quidax';
import crypto from 'crypto';

const log = debug('trade:test');
const authLog = debug('trade:auth');
const dbLog = debug('trade:db');
const quidaxLog = debug('trade:quidax');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestConfig {
  currencies: string[];
  tradeAmount: string;
  defaultCurrency: string;
  targetCurrency: string;
}

const TEST_CONFIG: TestConfig = {
  currencies: ['NGN', 'USDT'],
  tradeAmount: '1000',
  defaultCurrency: 'NGN',
  targetCurrency: 'USDT'
};

function generateReferralCode(length = 8): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

async function createTestUser(email: string): Promise<any> {
  try {
    // First verify if user exists and delete
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      authLog('🔄 Deleting existing user...');
      await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // Wait a moment for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    authLog('🔑 Creating auth user...');
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'SecureUserPass123!',
      email_confirm: true
    });

    if (createError) throw createError;
    if (!user) throw new Error('Failed to create auth user');

    dbLog('👤 Creating user profile...');
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: email,
        first_name: 'Test',
        last_name: 'User',
        is_verified: true,
        kyc_level: 2,
        kyc_status: 'approved'
      });

    if (profileError) {
      dbLog('❌ User profile creation failed:', profileError);
      throw profileError;
    }
    dbLog('✅ User profile created');

    quidaxLog('🔄 Creating Quidax sub-account...');
    const quidaxUser = await TestQuidaxService.createSubAccount({
      email: email,
      first_name: 'Test',
      last_name: 'User'
    });
    quidaxLog('✅ Quidax sub-account created:', quidaxUser.id);

    dbLog('🏷️ Creating user profile with referral...');
    const referralCode = generateReferralCode();
    const { error: userProfileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        kyc_tier: 'tier2',
        daily_limit: 1000000,
        monthly_limit: 50000000,
        kyc_verified: true,
        quidax_id: quidaxUser.id,
        documents: {
          nin: 'verified',
          bvn: 'verified'
        }
      });

    if (userProfileError) {
      dbLog('❌ User profile creation failed:', userProfileError);
      throw userProfileError;
    }
    dbLog('✅ User profile created with referral');

    dbLog('💰 Creating wallets...');
    const currencies = ['ngn', 'btc', 'eth', 'usdt', 'usdc'];
    for (const currency of currencies) {
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          currency: currency.toUpperCase(),
          balance: currency === 'NGN' ? 1000000 : 0,
          is_test: true,
          quidax_wallet_id: quidaxUser.id
        });

      if (walletError) {
        dbLog(`❌ Wallet creation failed for ${currency}:`, walletError);
        throw walletError;
      }
      dbLog(`✅ Wallet created for ${currency}`);
    }

    return {
      id: user.id,
      user_id: user.id,
      quidax_id: quidaxUser.id,
      kyc_tier: 'tier2',
      kyc_verified: true
    };
  } catch (error: any) {
    log('❌ User creation failed:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
}

async function testTrade() {
  try {
    log(' Starting trade test flow...');
    const testEmail = process.env.TEST_USER_EMAIL || 'user2@trustbank.tech';
    
    // First check if user exists in auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const existingAuthUser = (users as User[]).find(u => u.email === testEmail);
    if (existingAuthUser) {
      log('🔄 Deleting existing user first...');
      await supabase.auth.admin.deleteUser(existingAuthUser.id);
    }

    const profile = await createTestUser(testEmail);
    if (!profile) throw new Error('Failed to create test user');
    
    log('✅ Test user profile ready:', profile);

    // Get wallet balances
    const walletChecks = await Promise.all(
      TEST_CONFIG.currencies.map(async (currency: string) => {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', profile.user_id)
          .eq('currency', currency)
          .single();
        return { currency, balance: wallet?.balance || 0 };
      })
    );
    log('💰 Current wallet balances:', walletChecks);

    // Create swap quotation
    const quotation = await QuidaxService.createSwapQuotation({
      user_id: profile.quidax_id,
      from_currency: TEST_CONFIG.defaultCurrency.toLowerCase(),
      to_currency: TEST_CONFIG.targetCurrency.toLowerCase(),
      from_amount: TEST_CONFIG.tradeAmount
    });
    log('📊 Swap quotation created:', quotation);

    const swapResult = await QuidaxService.confirmSwapQuotation(
      profile.quidax_id,
      quotation.id
    );
    log('✅ Swap confirmed:', swapResult);

    // Wait for transaction to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    log('🏁 Trade completed successfully');

    return true;
  } catch (error: any) {
    log('❌ Trade test failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

testTrade()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 