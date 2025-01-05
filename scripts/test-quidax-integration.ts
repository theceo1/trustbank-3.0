import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { QuidaxClient } from '../app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '../app/lib/config/quidax';

const TEST_USER = {
  email: 'test1735848851306@trustbank.tech',
  password: 'trustbank123'
};

async function main() {
  console.log('Starting Quidax integration test...');
  
  // Initialize clients
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const quidaxClient = new QuidaxClient();

  try {
    // 1. Sign in test user
    console.log('\n1. Signing in test user...');
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword(TEST_USER);
    if (signInError) throw signInError;
    console.log('✓ Successfully signed in');

    // 2. Get user profile
    console.log('\n2. Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session!.user.id)
      .single();
    if (profileError) throw profileError;
    console.log('✓ Profile found:', {
      quidax_id: profile.quidax_id,
      is_verified: profile.is_verified,
      kyc_status: profile.kyc_status
    });

    // 3. Verify Quidax account
    console.log('\n3. Verifying Quidax account...');
    if (!profile.quidax_id) {
      console.log('Creating Quidax sub-account...');
      const quidaxUser = await quidaxClient.createSubAccount({
        email: TEST_USER.email,
        first_name: 'Test',
        last_name: 'User'
      });
      console.log('✓ Quidax account created:', quidaxUser.data.id);

      // Update profile with Quidax ID
      await supabase
        .from('user_profiles')
        .update({ quidax_id: quidaxUser.data.id })
        .eq('user_id', session!.user.id);
      
      profile.quidax_id = quidaxUser.data.id;
    } else {
      console.log('✓ Existing Quidax account found:', profile.quidax_id);
    }

    // 4. Fetch wallet balances
    console.log('\n4. Fetching wallet balances...');
    const wallets = await quidaxClient.fetchUserWallets(profile.quidax_id);
    console.log('✓ Wallets retrieved:', wallets.data.map(w => ({
      currency: w.currency,
      balance: w.balance,
      locked: w.locked
    })));

    // 5. Get market rate for USDT/NGN
    console.log('\n5. Getting market rate for USDT/NGN...');
    const rate = await quidaxClient.getRate('usdtngn');
    console.log('✓ Current rate:', rate.data);

    // 6. Create a test swap quotation (small amount)
    console.log('\n6. Creating test swap quotation...');
    const quotation = await quidaxClient.createSwapQuotation(profile.quidax_id, {
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: '1.0'
    });
    console.log('✓ Swap quotation created:', {
      id: quotation.data.id,
      from_amount: quotation.data.from_amount,
      to_amount: quotation.data.to_amount,
      expires_at: quotation.data.expires_at
    });

    console.log('\nAll tests completed successfully! ✨');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

main(); 