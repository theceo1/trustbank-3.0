//scripts/debug-auth-setup

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';
import debug from 'debug';

const log = debug('auth:debug');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      debug: true
    }
  }
);

async function debugAuthSetup() {
  let client;
  try {
    log('🔍 Starting detailed auth debugging...');
    
    client = await pool.connect();
    await client.query('BEGIN');

    // Check and create required functions
    log('Setting up auth functions...');
    await client.query(`
      -- Create encryption function
      CREATE OR REPLACE FUNCTION auth.encrypt_pass(password text)
      RETURNS text AS $$
      BEGIN
        RETURN extensions.crypt(password, extensions.gen_salt('bf'));
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create user management function
      CREATE OR REPLACE FUNCTION auth.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.users (id, email)
        VALUES (NEW.id, NEW.email);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create update timestamp function
      CREATE OR REPLACE FUNCTION auth.handle_user_update()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Create triggers
    log('Setting up triggers...');
    await client.query(`
      -- User creation trigger
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION auth.handle_new_user();

      -- User update trigger
      DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
      CREATE TRIGGER on_auth_user_updated
        BEFORE UPDATE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION auth.handle_user_update();
    `);

    // Set up permissions
    log('Setting up permissions...');
    await client.query(`
      -- Grant execute permissions on functions
      GRANT EXECUTE ON FUNCTION auth.encrypt_pass(text) TO service_role;
      GRANT EXECUTE ON FUNCTION auth.handle_new_user() TO service_role;
      GRANT EXECUTE ON FUNCTION auth.handle_user_update() TO service_role;

      -- Grant schema permissions
      GRANT USAGE ON SCHEMA auth TO postgres, supabase_auth_admin, authenticated, anon, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, supabase_auth_admin, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, supabase_auth_admin, service_role;
      
      -- Set default privileges
      ALTER DEFAULT PRIVILEGES IN SCHEMA auth 
        GRANT ALL ON TABLES TO postgres, supabase_auth_admin, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA auth 
        GRANT ALL ON SEQUENCES TO postgres, supabase_auth_admin, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA auth 
        GRANT ALL ON FUNCTIONS TO postgres, supabase_auth_admin, service_role;
    `);

    await client.query('COMMIT');

    // Test user creation with unique email
    const testEmail = `test${Date.now()}@example.com`;
    log('Testing user creation with email:', testEmail);
    
    const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test1234567',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });

    if (signupError) {
      log('❌ User creation failed:', signupError);
      // Check function existence
      const { rows: functions } = await client.query(`
        SELECT proname, proowner::regrole as owner
        FROM pg_proc
        WHERE pronamespace = 'auth'::regnamespace;
      `);
      log('Auth functions:', functions);
    } else {
      log('✅ User created successfully:', signupData);
    }

  } catch (error: any) {
    if (client) await client.query('ROLLBACK');
    log('❌ Debug process failed:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      position: error?.position
    });
  } finally {
    if (client) {
      await client.query('RESET ROLE');
      client.release();
    }
  }
}

debugAuthSetup();