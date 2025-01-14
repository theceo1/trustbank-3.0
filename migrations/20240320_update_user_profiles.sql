-- Create exec_sql function for running migrations
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add any missing columns to existing table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS referral_stats JSONB DEFAULT '{"totalReferrals": 0, "activeReferrals": 0, "totalEarnings": 0, "pendingEarnings": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS verification_status JSONB DEFAULT '{"tier1_verified": false, "tier2_verified": false, "tier3_verified": false}'::jsonb,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS quidax_id TEXT,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "email": {"marketing": false, "security": true, "trading": true, "news": false},
  "push": {"trading": true, "security": true, "price_alerts": true},
  "sms": {"security": true, "trading": true}
}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles(referral_code); 