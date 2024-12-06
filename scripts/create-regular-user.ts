//scripts/create-regular-user.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('user:create');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createRegularUser(email: string, password: string) {
  let client;
  try {
    log('Creating regular user...');
    
    // Create users table if it doesn't exist
    log('Ensuring users table exists...');
    client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id uuid PRIMARY KEY REFERENCES auth.users(id),
        email text UNIQUE,
        first_name text,
        last_name text,
        is_verified boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);
    log('✓ Users table ready');
    
    // Create auth user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        is_regular_user: true
      }
    });

    if (userError) throw userError;
    log('✓ Auth user created');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.user.id,
        email: email,
        first_name: 'Regular',
        last_name: 'User',
        is_verified: true
      });

    if (profileError) throw profileError;
    log('✓ User profile created');

    log('\n✨ Regular user created successfully');
    log('\nLogin credentials:');
    log('Email:', email);
    log('Password:', password);
    log('User ID:', user.user.id);

  } catch (error: any) {
    log('\n❌ Setup failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE',
      details: error?.details || {}
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

// Create a regular user
createRegularUser('user2@trustbank.tech', 'SecureUserPass123!'); 