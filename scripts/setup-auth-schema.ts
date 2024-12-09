import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupAuthSchema() {
  let client;
  try {
    console.log('Starting auth schema setup...');
    
    client = await pool.connect();
    
    // Execute schema setup directly
    await client.query(`
      -- Create auth schema
      CREATE SCHEMA IF NOT EXISTS auth;

      -- Create auth.users table if not exists
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
      );

      -- Grant permissions
      GRANT ALL ON SCHEMA auth TO service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
    `);

    console.log('✅ Auth schema and tables created successfully');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

setupAuthSchema(); 
