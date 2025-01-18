//scripts/debug-auth-setup

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTable(table: string, userId: string) {
  console.log(`\nChecking ${table} table for user ${userId}...`);
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(table === 'auth.users' ? 'id' : 'user_id', userId);

  if (error) {
    console.error(`❌ Error checking ${table}:`, error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log(`❌ No record found in ${table}`);
    return null;
  }

  console.log(`✓ Found record in ${table}:`, data[0]);
  return data[0];
}

async function debugAuthSetup() {
  try {
    console.log('Starting debug process...\n');

    // 1. Create test user in auth.users
    const email = `test_${Date.now()}@trustbank.tech`;
    console.log('Creating test user:', email);

    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password: 'trustbank123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        provider: 'google'
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!user) {
      throw new Error('No user returned from createUser');
    }

    console.log('✓ Created auth user:', user.id);

    // 2. Wait for trigger to execute (with timeout)
    console.log('\nWaiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Check each table
    const authUser = await checkTable('auth.users', user.id);
    const publicUser = await checkTable('users', user.id);
    const userProfile = await checkTable('user_profiles', user.id);

    // 4. Verify foreign key relationships
    console.log('\nVerifying relationships...');
    if (publicUser && userProfile) {
      console.log('✓ Foreign key relationships are valid');
    } else {
      console.log('❌ Missing records in dependent tables');
    }

    // 5. Check trigger logs
    console.log('\nChecking trigger execution logs...');
    const { data: logs, error: logsError } = await supabase
      .from('_trigger_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ Error fetching trigger logs:', logsError);
    } else if (logs && logs.length > 0) {
      console.log('✓ Found trigger logs:', logs);
    } else {
      console.log('❌ No trigger logs found');
    }

    // 6. Summary
    console.log('\nTest Summary:');
    console.log('-------------');
    console.log(`Auth User: ${authUser ? '✓' : '❌'}`);
    console.log(`Public User: ${publicUser ? '✓' : '❌'}`);
    console.log(`User Profile: ${userProfile ? '✓' : '❌'}`);

  } catch (error) {
    console.error('\n❌ Debug process failed:', error);
    process.exit(1);
  }
}

debugAuthSetup();