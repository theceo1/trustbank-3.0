// scripts/setup-test-users.ts
import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { TestQuidaxService } from './services/test-quidax';
import crypto from 'crypto';

const log = debug('setup:test-users');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  initial_balance: {
    ngn: number;
    usdt: number;
  };
}

const TEST_USERS: TestUser[] = [
  {
    email: 'seller@trustbank.tech',
    password: 'TestPass123!',
    first_name: 'Test',
    last_name: 'Seller',
    initial_balance: {
      ngn: 1000000, // 1M NGN
      usdt: 1000    // 1000 USDT
    }
  },
  {
    email: 'buyer@trustbank.tech',
    password: 'TestPass123!',
    first_name: 'Test',
    last_name: 'Buyer',
    initial_balance: {
      ngn: 1000000, // 1M NGN
      usdt: 0       // 0 USDT
    }
  }
];

interface TestUserResult {
  email: string;
  user_id: string;
  quidax_id: string;
}

// Add AuthUser interface to extend User with email
interface AuthUser extends User {
  email: string;
}

async function setupTestUsers() {
  try {
    log('🚀 Starting test users setup...');
    const results: TestUserResult[] = [];

    // Get all existing auth users with proper typing
    const { data: { users }, error: authListError } = 
      await supabase.auth.admin.listUsers() as { 
        data: { users: AuthUser[] }, 
        error: Error | null 
      };

    if (authListError) {
      throw new Error(`Failed to list auth users: ${authListError.message}`);
    }

    const existingUsers = users;

    for (const testUser of TEST_USERS) {
      log(`📝 Processing user: ${testUser.email}`);
      
      // Check existing auth user
      const existingUser = existingUsers.find(u => u.email === testUser.email);
      let userId = existingUser?.id;
      let quidaxId;

      if (existingUser) {
        log(`👤 Found existing auth user: ${testUser.email}`);
        
        // Check if profile exists
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('quidax_id')
          .eq('user_id', existingUser.id)
          .single();

        if (profile?.quidax_id) {
          log(`✅ Existing profile found with Quidax ID: ${profile.quidax_id}`);
          quidaxId = profile.quidax_id;
          results.push({
            email: testUser.email,
            user_id: existingUser.id,
            quidax_id: profile.quidax_id
          });
          continue; // Skip to next user if everything exists
        }
      } else {
        // Create new auth user if doesn't exist
        log(`👤 Creating new auth user: ${testUser.email}`);
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true
        });

        if (createError || !user) {
          throw new Error(`Auth user creation failed: ${createError?.message}`);
        }
        userId = user.id;
      }

      // Before creating profile or pushing results, validate userId
      if (!userId) {
        throw new Error(`User ID is undefined for ${testUser.email}`);
      }

      // Create Quidax account if needed
      if (!quidaxId) {
        log(`🔄 Creating Quidax account for: ${testUser.email}`);
        const quidaxUser = await TestQuidaxService.createSubAccount({
          email: testUser.email,
          first_name: testUser.first_name,
          last_name: testUser.last_name
        });
        quidaxId = quidaxUser.id;
      }

      // Create or update profile
      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      log(`📋 Creating/updating profile for: ${testUser.email}`);
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email: testUser.email,
          referral_code: referralCode,
          kyc_tier: 'tier2',
          daily_limit: 5000000,
          monthly_limit: 50000000,
          kyc_verified: true,
          quidax_id: quidaxId,
          documents: {
            nin: 'verified',
            bvn: 'verified'
          }
        });

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Create or update wallets
      log(`💰 Setting up wallets for: ${testUser.email}`);
      const currencies = ['ngn', 'usdt'];
      
      for (const currency of currencies) {
        const { error: walletError } = await supabase
          .from('wallets')
          .upsert({
            user_id: userId,
            currency: currency.toUpperCase(),
            balance: testUser.initial_balance[currency as keyof typeof testUser.initial_balance],
            is_test: true,
            quidax_wallet_id: quidaxId
          });

        if (walletError) {
          throw new Error(`Wallet setup failed for ${currency}: ${walletError.message}`);
        }
      }

      results.push({
        email: testUser.email,
        user_id: userId,
        quidax_id: quidaxId as string
      });

      log(`✅ Setup completed for: ${testUser.email}`);
    }

    log('🎉 All test users setup completed!');
    return results;
  } catch (error: any) {
    log('❌ Setup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupTestUsers()
    .then(results => {
      log('✨ Setup completed successfully:', results);
      process.exit(0);
    })
    .catch(error => {
      log('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { setupTestUsers }; 