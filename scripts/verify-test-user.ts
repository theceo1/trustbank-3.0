// scripts/verify-test-user.ts
import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('verify:test-user');
debug.enable('verify:*');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyTestUser(testEmail: string) {
  try {
    log(`🔍 Verifying user: ${testEmail}`);
    
    // 1. Check if user exists in auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const authUser = (users as User[]).find(u => u.email === testEmail);
    log('Auth user exists:', !!authUser);
    if (authUser) {
      log('Auth user details:', {
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: authUser.email_confirmed_at,
        lastSignIn: authUser.last_sign_in_at
      });
    }

    // 2. Check user profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser?.id)
      .single();
      
    log('\nUser profile exists:', !!profile);
    if (profile) log('Profile details:', profile);

    // 3. Check wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', authUser?.id);

    log('\nWallets:', wallets);
    if (walletsError) log('Wallet error:', walletsError);

    // 4. Try test login
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'TestPass123!'
    });

    log('\nLogin test:', loginError ? 'Failed' : 'Successful');
    if (loginError) log('Login error:', loginError);
    if (session) log('Session created successfully');

  } catch (error) {
    log('❌ Verification failed:', error);
  }
}

// Verify both test users
async function verifyAllTestUsers() {
  await verifyTestUser('user8@trustbank.tech');
  await verifyTestUser('user9@trustbank.tech');
}

verifyAllTestUsers(); 