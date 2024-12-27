import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('auth:fix');
debug.enable('auth:*');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAuthSetup() {
  let client;
  try {
    client = await pool.connect();
    
    // 1. Set role to postgres
    await client.query('SET ROLE postgres');
    
    // 2. Create auth schema if it doesn't exist
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      GRANT USAGE ON SCHEMA auth TO postgres, supabase_auth_admin;
    `);

    // 3. Create the auth.users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id uuid NOT NULL PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
        email text,
        email_confirmed_at timestamp with time zone,
        encrypted_password text,
        confirmation_token text,
        confirmation_sent_at timestamp with time zone,
        recovery_token text,
        recovery_sent_at timestamp with time zone,
        email_change_token text,
        email_change text,
        email_change_sent_at timestamp with time zone,
        last_sign_in_at timestamp with time zone,
        raw_app_meta_data jsonb,
        raw_user_meta_data jsonb,
        is_super_admin boolean,
        created_at timestamp with time zone,
        updated_at timestamp with time zone,
        phone text,
        phone_confirmed_at timestamp with time zone,
        phone_change text,
        phone_change_token text,
        phone_change_sent_at timestamp with time zone,
        confirmed_at timestamp with time zone,
        email_change_confirm_status smallint,
        banned_until timestamp with time zone,
        reauthentication_token text,
        reauthentication_sent_at timestamp with time zone,
        is_sso_user boolean DEFAULT false NOT NULL,
        deleted_at timestamp with time zone
      );
    `);

    // 4. Grant necessary permissions
    await client.query(`
      GRANT ALL ON auth.users TO postgres, supabase_auth_admin;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, supabase_auth_admin;
    `);

    log('✅ Auth setup fixed successfully');

  } catch (error) {
    log('❌ Failed to fix auth setup:', error);
    throw error;
  } finally {
    if (client) {
      await client.query('RESET ROLE');
      client.release();
    }
  }
}

fixAuthSetup(); 