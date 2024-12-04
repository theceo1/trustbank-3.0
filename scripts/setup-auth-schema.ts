import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('auth:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Verify environment variables
console.log('Environment check:', {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAuthSchema() {
  try {
    console.log(' Starting auth schema setup...');

    // 1. Basic connectivity test (referenced from verify-db-setup.ts, lines 20-31)
    console.log('\n1️⃣ Testing basic connectivity...');
    const { data: tableList, error: tableError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('Note: Users table not found, will be created');
    } else {
      console.log('✅ Basic connectivity test passed');
    }

    // 2. Create auth schema and tables (referenced from setup-auth-tables.ts, lines 16-106)
    console.log('\n2️⃣ Creating auth schema and tables...');
    const { error: setupError } = await supabase
      .from('_setup')
      .insert({
        query: `
          -- Create auth schema
          CREATE SCHEMA IF NOT EXISTS auth;

          -- Create auth.users table
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
        `
      });

    if (setupError) {
      console.error('❌ Schema setup failed:', setupError);
      throw setupError;
    }
    console.log('✅ Auth schema and tables created successfully');

    console.log('\n✅ Setup completed successfully');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error);
    if (error.code) console.error('Error code:', error.code);
    if (error.message) console.error('Error message:', error.message);
    if (error.details) console.error('Error details:', error.details);
    process.exit(1);
  }
}

setupAuthSchema(); 