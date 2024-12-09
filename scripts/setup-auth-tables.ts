import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('auth:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Log environment variables status
log('Environment check:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupAuthTables() {
  let client;
  try {
    log('🔧 Starting auth tables setup...');
    
    log('Connecting to database...');
    client = await pool.connect();
    log('✓ Database connection successful');

    log('Beginning transaction...');
    await client.query('BEGIN');

    try {
      // Create schema
      log('Creating auth schema...');
      await client.query('CREATE SCHEMA IF NOT EXISTS auth');
      log('✓ Auth schema created');

      // Create users table
      log('Creating auth.users table...');
      try {
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
        log('✓ Users table created');
      } catch (error: any) {
        log('Error creating users table:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        throw error;
      }

      // Create identities table
      log('Creating auth.identities table...');
      try {
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
        log('✓ Identities table created');
      } catch (error: any) {
        log('Error creating identities table:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        throw error;
      }

      // Create sessions table
      log('Creating auth.sessions table...');
      try {
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
        log('✓ Sessions table created');
      } catch (error: any) {
        log('Error creating sessions table:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        throw error;
      }

      // Create mfa_factors table
      log('Creating auth.mfa_factors table...');
      try {
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
        log('✓ MFA factors table created');
      } catch (error: any) {
        log('Error creating mfa_factors table:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        throw error;
      }

      // Create one_time_tokens table
      log('Creating auth.one_time_tokens table...');
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
            id uuid PRIMARY KEY,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            token_hash text NOT NULL,
            created_at timestamptz,
            updated_at timestamptz
          )
        `);
        log('✓ One-time tokens table created');
      } catch (error: any) {
        log('Error creating one_time_tokens table:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        throw error;
      }

      // Set permissions
      log('Setting up permissions...');
      try {
        await client.query(`
          GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
          GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
          GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
        `);
        log('✓ Permissions granted');
      } catch (error: any) {
        log('Error setting permissions:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
        throw error;
      }

      await client.query('COMMIT');
      log('✨ Auth tables setup completed successfully');

    } catch (error: any) {
      log('Error during setup:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    log('\n❌ Setup failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE',
      details: error?.details || {}
    });
    process.exit(1);
  } finally {
    if (client) {
      log('Releasing database connection...');
      client.release();
    }
  }
  log('Creating auth schema...');
  await client.query('CREATE SCHEMA IF NOT EXISTS auth');
  log('✓ Auth schema created');
}

setupAuthTables();