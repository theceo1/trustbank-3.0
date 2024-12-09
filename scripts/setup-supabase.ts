//scripts/setup-supabase.ts
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { resolve } = require('path');
const { Pool } = require('pg');
const debugLib = require('debug');

const log = debugLib('supabase:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Enable debug logging
process.env.DEBUG = 'supabase:setup';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      debug: true
    }
  }
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupSupabase() {
  let client;
  try {
    log('Starting Supabase setup with debug logging...');
    
    // Test database connection
    log('Testing database connection...');
    client = await pool.connect();
    log('✓ Database connection successful');

    // Test Supabase connection
    log('Testing Supabase connection...');
    const { data: authConfig, error: configError } = await supabase.auth.getSession();
    if (configError) {
      log('✗ Supabase connection error:', configError);
      throw configError;
    }
    log('✓ Supabase connection successful');

    // Create schema and tables with detailed logging
    log('Creating schema and tables...');
    await client.query('BEGIN');
    
    // Execute each statement separately for better error tracking
    log('Creating auth schema...');
    await client.query('CREATE SCHEMA IF NOT EXISTS auth');
    
    log('Creating auth.users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        instance_id uuid,
        id uuid PRIMARY KEY,
        aud varchar(255),
        role varchar(255),
        email varchar(255),
        encrypted_password varchar(255),
        email_confirmed_at timestamptz,
        invited_at timestamptz,
        confirmation_token varchar(255),
        confirmation_sent_at timestamptz,
        recovery_token varchar(255),
        recovery_sent_at timestamptz,
        email_change_token_new varchar(255),
        email_change varchar(255),
        email_change_sent_at timestamptz,
        last_sign_in_at timestamptz,
        raw_app_meta_data jsonb,
        raw_user_meta_data jsonb,
        is_super_admin boolean,
        created_at timestamptz,
        updated_at timestamptz,
        phone varchar(255),
        phone_confirmed_at timestamptz,
        phone_change varchar(255) DEFAULT '',
        phone_change_token varchar(255) DEFAULT '',
        phone_change_sent_at timestamptz,
        confirmed_at timestamptz,
        email_change_token_current varchar(255) DEFAULT '',
        email_change_confirm_status smallint DEFAULT 0,
        banned_until timestamptz,
        reauthentication_token varchar(255) DEFAULT '',
        reauthentication_sent_at timestamptz,
        is_sso_user boolean DEFAULT false,
        deleted_at timestamptz,
        is_anonymous boolean DEFAULT false
      )
    `);

    log('Creating auth.identities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.identities (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        identity_data jsonb NOT NULL,
        provider varchar(255) NOT NULL,
        last_sign_in_at timestamptz,
        created_at timestamptz,
        updated_at timestamptz,
        UNIQUE(provider, user_id)
      )
    `);

    log('Creating auth.sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.sessions (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at timestamptz,
        updated_at timestamptz,
        factor_id uuid,
        aal varchar(255),
        not_after timestamptz
      )
    `);

    log('Creating auth.mfa_factors table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.mfa_factors (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        friendly_name text,
        factor_type text NOT NULL,
        status text NOT NULL,
        created_at timestamptz,
        updated_at timestamptz,
        secret text
      )
    `);

    log('Creating auth.one_time_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        token_hash text NOT NULL,
        created_at timestamptz,
        updated_at timestamptz
      )
    `);

    log('Creating profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT,
        name TEXT,
        referral_code TEXT,
        referred_by TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    log('Creating wallets table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.wallets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES auth.users(id),
        balance NUMERIC DEFAULT 0,
        currency TEXT DEFAULT 'NGN',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    log('Setting up permissions...');
    await client.query(`
      GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
      GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
    `);

    // Test user creation with detailed logging
    log('Creating test user...');
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
      email_confirm: true
    });

    if (userError) {
      log('✗ Test user creation failed:', userError);
      throw userError;
    }
    log('✓ Test user created:', user?.user?.email);

    await client.query('COMMIT');
    log('✓ Setup completed successfully');

  } catch (error: any) {
    if (client) await client.query('ROLLBACK');
    const formattedError = {
      message: typeof error === 'object' ? error?.message || 'Unknown error' : 'Unknown error',
      code: typeof error === 'object' ? error?.code || 'NO_CODE' : 'NO_CODE',
      details: typeof error === 'object' && error?.details ? error.details : {}
    };
    
    log('✗ Setup failed with error:', formattedError);
    throw error;
  } finally {
    if (client) client.release();
  }
}

setupSupabase().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 