import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setupTestUser() {
  console.log('[INFO] Starting test user setup...');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('[INFO] Environment variables:', {
    supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
    serviceRoleKey: serviceRoleKey ? '✓ Set' : '✗ Missing'
  });

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing required environment variables');
  }

  // Initialize Supabase admin client
  console.log('[INFO] Initializing Supabase admin client...');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = 'test1735848851306@trustbank.tech';
  const password = 'trustbank123';
  const quidaxId = '157fa815-214e-4ecd-8a25-448fe4815ff1';

  try {
    // Get existing user
    console.log('[INFO] Checking for existing user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('[ERROR] Failed to list users:', listError);
      throw listError;
    }

    const existingUser = users.find(u => u.email === email);
    let userId: string;

    if (existingUser) {
      console.log('[INFO] Updating existing user...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password, email_confirm: true }
      );

      if (updateError) {
        console.error('[ERROR] Failed to update user:', updateError);
        throw updateError;
      }

      userId = existingUser.id;
      console.log('[SUCCESS] User updated:', { id: userId, email });
    } else {
      console.log('[INFO] Creating new user...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (createError) {
        console.error('[ERROR] Failed to create user:', createError);
        throw createError;
      }

      userId = newUser.user.id;
      console.log('[SUCCESS] User created:', { id: userId, email });
    }

    // Ensure user exists in public.users table
    console.log('[INFO] Ensuring user exists in public.users table...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        first_name: 'John',
        last_name: 'Doe',
        kyc_level: 0,
        kyc_status: 'pending',
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        quidax_id: quidaxId
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('[ERROR] Failed to create/update user record:', userError);
      throw userError;
    }

    console.log('[SUCCESS] User record created/updated');

    // Create or update user profile
    console.log('[INFO] Creating/updating user profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email,
        name: 'John Doe',
        full_name: 'John Doe',
        kyc_status: 'pending',
        kyc_level: 0,
        quidax_id: quidaxId,
        is_verified: false,
        verification_status: 'pending',
        daily_limit: 1000000, // 1M
        monthly_limit: 5000000, // 5M
        is_test: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('[ERROR] Failed to create/update user profile:', profileError);
      throw profileError;
    }

    console.log('[SUCCESS] User profile created/updated');

    // Verify setup
    console.log('[INFO] Verifying user setup...');
    const { data: profile, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('[ERROR] Failed to verify user setup:', verifyError);
    } else {
      console.log('[SUCCESS] User setup verified:', profile);
    }

    console.log('\n[INFO] Test user credentials:');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
    throw error;
  }
}

setupTestUser()
  .catch(console.error)
  .finally(() => process.exit()); 