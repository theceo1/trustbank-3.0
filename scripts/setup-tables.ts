import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const log = debug('setup:tables');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupTables() {
  try {
    console.log('Setting up database tables...');

    // Create users table first
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        kyc_level INTEGER DEFAULT 0,
        kyc_status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Then create user_profiles table with correct foreign key
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id),
        email TEXT,
        full_name TEXT,
        quidax_id TEXT,
        kyc_status TEXT DEFAULT 'pending',
        kyc_level INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        daily_limit DECIMAL DEFAULT 50000,
        monthly_limit DECIMAL DEFAULT 1000000,
        referral_code TEXT UNIQUE,
        referral_stats JSONB DEFAULT '{"totalReferrals": 0, "activeReferrals": 0, "totalEarnings": 0, "pendingEarnings": 0}'::jsonb,
        notification_settings JSONB DEFAULT '{
          "email": {"marketing": false, "security": true, "trading": true, "news": false},
          "push": {"trading": true, "security": true, "price_alerts": true},
          "sms": {"security": true, "trading": true}
        }'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;

    // Create the trigger function
    const createTriggerFunction = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        quidax_response JSONB;
        quidax_user_id TEXT;
      BEGIN
        -- First create the user record
        INSERT INTO public.users (id, email, first_name, last_name, is_verified)
        VALUES (
          NEW.id,
          NEW.email,
          NEW.raw_user_meta_data->>'first_name',
          NEW.raw_user_meta_data->>'last_name',
          CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
        );

        -- Create Quidax sub-account using plpgsql http extension
        SELECT content::jsonb->'data'->>'id' INTO quidax_user_id
        FROM http((
          'POST',
          current_setting('app.quidax_api_url') || '/users',
          ARRAY[http_header('Authorization', 'Bearer ' || current_setting('app.quidax_secret_key'))],
          'application/json',
          jsonb_build_object(
            'email', NEW.email,
            'first_name', COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
            'last_name', COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
          )::text
        ));

        -- Then create the profile with Quidax ID
        INSERT INTO public.user_profiles (
          user_id,
          email,
          full_name,
          quidax_id,
          referral_code
        ) VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          quidax_user_id,
          'TB' || substring(md5(random()::text) from 1 for 6)
        );

        RETURN NEW;
      EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't prevent user creation
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Create the trigger
    const createTrigger = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `;

    // Execute the SQL
    const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersTable });
    if (usersError) throw usersError;
    console.log('✓ Users table created');

    const { error: profilesError } = await supabase.rpc('exec_sql', { sql: createProfilesTable });
    if (profilesError) throw profilesError;
    console.log('✓ User profiles table created');

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: createTriggerFunction });
    if (functionError) throw functionError;
    console.log('✓ Trigger function created');

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTrigger });
    if (triggerError) throw triggerError;
    console.log('✓ Trigger created');

    console.log('\nDatabase setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupTables(); 