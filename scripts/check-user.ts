import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkUser() {
  console.log('[INFO] Starting user check...');

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

  try {
    // Check auth.users table
    console.log('[INFO] Checking auth.users table...');
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('[ERROR] Failed to list users:', authError);
    } else {
      const user = authUser.users.find(u => u.email === email);
      console.log('[INFO] User in auth.users:', user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      } : 'Not found');
    }

    // Check user_profiles table
    console.log('[INFO] Checking user_profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('[ERROR] Failed to fetch user profile:', profileError);
    } else {
      console.log('[INFO] User in user_profiles:', profile);
    }

  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
    throw error;
  }
}

checkUser()
  .catch(console.error)
  .finally(() => process.exit()); 