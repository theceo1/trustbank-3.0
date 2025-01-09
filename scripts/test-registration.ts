import { createClient } from '@supabase/supabase-js';
import { QuidaxService } from '../app/lib/services/quidax';
import { getWalletService } from '../app/lib/services/quidax-wallet';
import debug from 'debug';
import dotenv from 'dotenv';
import { DojahService } from '@/app/lib/services/dojah';

// Load environment variables
dotenv.config({ path: '.env.local' });

const log = debug('test:registration');

async function testRegistrationFlow() {
  try {
    log('🚀 Starting registration flow test...');

    // 1. Create test user
    const testUser = {
      email: `test${Date.now()}@trustbank.tech`,
      password: 'TestPassword123!',
      fullName: 'Test User',
      nin: '70123456789' // Dojah test NIN
    };

    log('👤 Test user details:', {
      email: testUser.email,
      fullName: testUser.fullName
    });

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Register user
    log('📝 Registering user...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error('No user data returned from signup');
    }

    log('✅ User registered successfully:', {
      userId: authData.user.id,
      email: authData.user.email
    });

    // Add delay to allow auth user to be fully created
    log('⏳ Waiting for auth user to be fully created...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create user record
    log('👤 Creating user record...');
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: testUser.fullName.split(' ')[0],
        last_name: testUser.fullName.split(' ')[1] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (userError) {
      throw userError;
    }

    log('✅ User record created');

    // 3. Create user profile
    log('👤 Creating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        user_id: authData.user.id,
        full_name: testUser.fullName,
        is_verified: false,
        kyc_level: 0,
        is_test: true
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    log('✅ User profile created:', profileData);

    // 4. Start KYC verification
    log('🔍 Starting KYC verification...');
    const dojah = new DojahService();

    // Verify NIN with selfie
    const selfieImage = 'BASE64_ENCODED_TEST_SELFIE'; // Replace with actual test image
    const verificationResult = await dojah.verifyNINWithSelfie({
      nin: testUser.nin,
      selfieImage,
      firstName: testUser.fullName.split(' ')[0],
      lastName: testUser.fullName.split(' ')[1]
    });

    log('📋 NIN verification result:', verificationResult);

    // 5. Update KYC status
    if (verificationResult.entity.selfie_verification.match) {
      log('✅ KYC verification successful');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          is_verified: true,
          kyc_level: 1,
          kyc_status: 'verified'
        })
        .eq('id', authData.user.id);

      if (updateError) {
        throw updateError;
      }

      log('✅ User profile updated with KYC status');
    } else {
      log('❌ KYC verification failed');
    }

    // 6. Create Quidax wallet
    log('💰 Creating Quidax wallet...');
    const walletService = getWalletService();
    const wallet = await walletService.getWallet(authData.user.id, 'usdt');

    log('✅ Wallet created:', wallet);

    return {
      success: true,
      user: authData.user,
      profile: profileData,
      kycStatus: verificationResult,
      wallet
    };

  } catch (error) {
    log('❌ Error in registration flow:', error);
    throw error;
  }
}

// Run the test
testRegistrationFlow()
  .then(result => {
    log('🎉 Registration flow test completed successfully:', result);
    process.exit(0);
  })
  .catch(error => {
    log('❌ Registration flow test failed:', error);
    process.exit(1);
  }); 