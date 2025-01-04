import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAuth() {
  console.log('[INFO] Starting authentication test...');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[INFO] Environment variables:', {
    supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
    supabaseAnonKey: supabaseAnonKey ? '✓ Set' : '✗ Missing',
    actualUrl: supabaseUrl // Log actual URL to verify
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables');
  }

  // Initialize Supabase client
  console.log('[INFO] Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false // Don't persist the session since this is a test
    }
  });

  // Test credentials
  const email = 'test1735848851306@trustbank.tech';
  const password = 'trustbank123';

  try {
    // First check if user exists
    console.log('[INFO] Checking user in auth.users...');
    const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[ERROR] Failed to get user:', userError);
    } else {
      console.log('[INFO] Current user:', existingUser ? {
        id: existingUser.id,
        email: existingUser.email,
        created_at: existingUser.created_at
      } : 'Not signed in');
    }
    
    // Attempt sign in
    console.log('[INFO] Attempting to sign in with credentials:', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('[ERROR] Sign in failed:', {
        message: error.message,
        status: error.status,
        name: error.name,
        details: error
      });
      throw error;
    }

    console.log('[SUCCESS] Successfully signed in:', {
      userId: data.user?.id,
      email: data.user?.email,
      lastSignIn: data.user?.last_sign_in_at
    });

    // Check user profile
    console.log('[INFO] Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user?.id)
      .single();

    if (profileError) {
      console.error('[ERROR] Failed to fetch user profile:', profileError);
    } else {
      console.log('[SUCCESS] User profile:', profile);
    }

    // Check user record
    console.log('[INFO] Fetching user record...');
    const { data: userRecord, error: recordError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (recordError) {
      console.error('[ERROR] Failed to fetch user record:', recordError);
    } else {
      console.log('[SUCCESS] User record:', userRecord);
    }

  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
    throw error;
  }
}

testAuth()
  .catch(console.error)
  .finally(() => process.exit()); 