-- Switch to supabase_admin role for table creation
SET ROLE supabase_admin;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  kyc_level INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT DEFAULT 'NG',
  referral_code TEXT UNIQUE,
  referral_stats JSONB DEFAULT '{"totalReferrals": 0, "activeReferrals": 0, "totalEarnings": 0, "pendingEarnings": 0}'::jsonb,
  verification_status JSONB DEFAULT '{"tier1_verified": false, "tier2_verified": false, "tier3_verified": false}'::jsonb,
  two_factor_enabled BOOLEAN DEFAULT false,
  api_keys JSONB DEFAULT '[]'::jsonb,
  notification_settings JSONB DEFAULT '{
    "email": {"marketing": false, "security": true, "trading": true, "news": false},
    "push": {"trading": true, "security": true, "price_alerts": true},
    "sms": {"security": true, "trading": true}
  }'::jsonb,
  kyc_status TEXT DEFAULT 'pending',
  kyc_level INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  daily_limit DECIMAL(20, 2) DEFAULT 50000,
  monthly_limit DECIMAL(20, 2) DEFAULT 1000000,
  quidax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _user_exists boolean;
BEGIN
  -- Log start of function
  RAISE LOG 'Starting handle_new_user trigger for user % with email %', NEW.id, NEW.email;

  -- Check if user exists in public.users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = NEW.id
  ) INTO _user_exists;

  -- Create user in public.users if not exists
  IF NOT _user_exists THEN
    RAISE LOG 'Creating user record in public.users for %', NEW.id;
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      is_verified,
      kyc_level,
      kyc_status,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      CASE 
        WHEN NEW.email_confirmed_at IS NOT NULL THEN true
        ELSE false
      END,
      0,
      'pending',
      NEW.created_at,
      NEW.updated_at
    );
    RAISE LOG 'Successfully created user record in public.users for %', NEW.id;
  ELSE
    RAISE LOG 'User % already exists in public.users', NEW.id;
  END IF;

  -- Now create the profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = NEW.id) THEN
    RAISE LOG 'Creating profile for user %', NEW.id;
    INSERT INTO public.user_profiles (
      user_id,
      email,
      full_name,
      is_verified,
      kyc_level,
      kyc_status,
      daily_limit,
      monthly_limit,
      referral_code,
      referral_stats,
      notification_settings
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      false,
      0,
      'pending',
      50000,
      1000000,
      'TB' || substring(md5(random()::text) from 1 for 6),
      jsonb_build_object(
        'totalReferrals', 0,
        'activeReferrals', 0,
        'totalEarnings', 0,
        'pendingEarnings', 0
      ),
      jsonb_build_object(
        'email', jsonb_build_object(
          'marketing', false,
          'security', true,
          'trading', true,
          'news', false
        ),
        'push', jsonb_build_object(
          'trading', true,
          'security', true,
          'price_alerts', true
        ),
        'sms', jsonb_build_object(
          'security', true,
          'trading', true
        )
      )
    );
    RAISE LOG 'Successfully created profile for user %', NEW.id;
  ELSE
    RAISE LOG 'Profile already exists for user %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error details
  RAISE LOG 'Error in handle_new_user for %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  -- Don't fail the transaction, just log the error
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create or update indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_quidax_id ON public.user_profiles(quidax_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc ON public.user_profiles(kyc_level, kyc_status);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Reset role
RESET ROLE; 