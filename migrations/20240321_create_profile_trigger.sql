-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    is_verified,
    kyc_level,
    kyc_status,
    daily_limit,
    monthly_limit,
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 