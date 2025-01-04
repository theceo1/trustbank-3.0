import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkSchema() {
  console.log('[INFO] Starting schema check...');

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

  try {
    // Get user_profiles table information
    console.log('[INFO] Fetching user_profiles table information...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select()
      .limit(1);

    if (profileError) {
      console.error('[ERROR] Failed to fetch user_profiles information:', profileError);
    } else {
      // Log column names from the response
      if (profileData && profileData.length > 0) {
        const columns = Object.keys(profileData[0]);
        console.log('[INFO] user_profiles columns:', columns);
      } else {
        console.log('[INFO] No rows found in user_profiles table');
      }
    }

    // Get users table information
    console.log('\n[INFO] Fetching users table information...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select()
      .limit(1);

    if (userError) {
      console.error('[ERROR] Failed to fetch users information:', userError);
    } else {
      // Log column names from the response
      if (userData && userData.length > 0) {
        const columns = Object.keys(userData[0]);
        console.log('[INFO] users columns:', columns);
      } else {
        console.log('[INFO] No rows found in users table');
      }
    }

  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
    throw error;
  }
}

checkSchema()
  .catch(console.error)
  .finally(() => process.exit()); 