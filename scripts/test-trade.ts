//scripts/test-trade.ts

import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { QuidaxService } from '../scripts/services/quidax';
import { TestQuidaxService } from './services/test-quidax';
import crypto from 'crypto';

const log = debug('trade:test');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

process.env.DEBUG = 'trade:*';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserProfile {
  id: string;
  user_id: string;
  quidax_id: string;
  kyc_tier: string;
  kyc_verified: boolean;
  users: {
    email: string;
  }[];
}

const TEST_CONFIG = {
  currencies: ['NGN', 'USDT'],
  tradeAmount: '1000',
  defaultCurrency: 'NGN',
  targetCurrency: 'USDT'
};

async function createTestUser(email: string): Promise<UserProfile> {
  // First check and delete if user exists
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) throw authError;
  
  const existingUser = (users as User[]).find(u => u.email === email);
  if (existingUser) {
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  // Create new auth user with specified password
  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: 'SecureUserPass123!',
    email_confirm: true
  });

  if (createError) throw createError;
  if (!user) throw new Error('Failed to create auth user');

  // Create user profile
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

  if (profileError) throw profileError;

  return { 
    id: user.id,
    user_id: user.id,
    quidax_id: '',
    kyc_tier: 'tier2',
    kyc_verified: true,
    users: [{ email: email }]
  };
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

    const walletChecks = await Promise.all(
      TEST_CONFIG.currencies.map(async (currency) => {
        const balance = await QuidaxService.checkWalletBalance(profile.quidax_id, currency.toLowerCase());
        return { currency, balance };
      })
    );
    log('💰 Current wallet balances:', walletChecks);

    const quotation = await QuidaxService.createSwapQuotation(
      profile.quidax_id,
      {
        from_currency: TEST_CONFIG.defaultCurrency,
        to_currency: TEST_CONFIG.targetCurrency,
        from_amount: TEST_CONFIG.tradeAmount
      }
    );
    log('📊 Swap quotation created:', quotation);

    const swapResult = await QuidaxService.confirmSwapQuotation(
      profile.quidax_id,
      quotation.id
    );
    log('✅ Swap confirmed:', swapResult);

    await QuidaxService.monitorTransaction(swapResult.id);
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