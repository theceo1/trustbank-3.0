//scripts/test-trade-flow.ts
import { QuidaxSwapService } from '../app/lib/services/quidax-swap';
import supabaseClient from '../app/lib/supabase/client';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTestUser() {
  console.log('\n[Test] Creating test user...');
  const email = `test${Date.now()}@trustbank.tech`;
  const password = 'TestPassword123!';
  const firstName = 'John';
  const lastName = 'Doe';
  const nin = '70123456789'; // Test NIN

  try {
    // Create user in Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          nin: nin,
          kyc_level: 1,
        },
      },
    });

    if (authError) throw authError;
    console.log('[Test] Created Supabase user:', authData.user?.id);

    // Create Quidax subaccount
    const response = await fetch('https://www.quidax.com/api/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Quidax subaccount: ${error.message}`);
    }

    const quidaxData = await response.json();
    console.log('[Test] Created Quidax subaccount:', quidaxData);

    // Update user profile with Quidax ID
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ quidax_id: quidaxData.data.id })
      .eq('id', authData.user?.id);

    if (updateError) throw updateError;
    console.log('[Test] Updated user profile with Quidax ID');

    return {
      userId: authData.user?.id,
      quidaxId: quidaxData.data.id,
      email,
    };
  } catch (error) {
    console.error('[Test] Error creating test user:', error);
    throw error;
  }
}

async function testTradeFlow() {
  console.log('\n[Test] Starting trade flow test...');
  try {
    // Create test user
    const { quidaxId } = await createTestUser();
    console.log('[Test] Test user created successfully');

    // Wait for account setup
    console.log('[Test] Waiting for account setup...');
    await sleep(5000);

    // Get temporary NGN to USDT quote
    console.log('\n[Test] Getting temporary NGN to USDT quote...');
    const { data: tempQuote } = await QuidaxSwapService.getTemporaryQuotation({
      user_id: quidaxId,
      from_currency: 'ngn',
      to_currency: 'usdt',
      from_amount: '1000', // 1000 NGN
    });

    console.log('[Test] Received temporary quote:', tempQuote);
    console.log('[Test] Rate:', tempQuote.quoted_price);
    console.log('[Test] You will receive:', tempQuote.to_amount, tempQuote.to_currency);

    // Get actual quote
    console.log('\n[Test] Getting actual quote...');
    const { data: quotation } = await QuidaxSwapService.createSwapQuotation({
      user_id: quidaxId,
      from_currency: 'ngn',
      to_currency: 'usdt',
      from_amount: '1000',
    });

    console.log('[Test] Received quotation:', quotation);
    console.log('[Test] Rate:', parseFloat(quotation.quoted_price).toFixed(8));
    console.log('[Test] You will receive:', quotation.to_amount, 'USDT');
    console.log('[Test] Quote expires at:', new Date(quotation.expires_at).toLocaleString());

    // Calculate time until expiration
    const expiresAt = new Date(quotation.expires_at).getTime();
    const now = new Date().getTime();
    const timeLeft = Math.floor((expiresAt - now) / 1000);
    console.log('[Test] Quote expires in:', timeLeft, 'seconds');

    // For testing purposes, we won't confirm the swap since we don't have funds
    // But we'll verify that the quote matches the temporary quote
    const tempRate = parseFloat(tempQuote.quoted_price);
    const actualRate = parseFloat(quotation.quoted_price);
    const rateDiff = Math.abs(tempRate - actualRate);
    
    console.log('\n[Test] Quote comparison:');
    console.log('Temporary rate:', tempRate);
    console.log('Actual rate:', actualRate);
    console.log('Rate difference:', rateDiff);
    
    if (rateDiff > 10) { // Allow for some price movement
      throw new Error('Significant difference between temporary and actual quotes');
    }

    console.log('\n[Test] Trade flow test completed successfully');
    console.log('[Test] Note: Swap confirmation was skipped as this is a test environment');

    return {
      temporaryQuote: tempQuote,
      quotation,
    };
  } catch (error) {
    console.error('\n[Test] Trade flow test failed:', error);
    throw error;
  }
}

// Run the test
testTradeFlow()
  .then(() => {
    console.log('\n[Test] All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n[Test] Tests failed:', error);
    process.exit(1);
  }); 