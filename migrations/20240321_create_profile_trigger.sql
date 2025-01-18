-- Create a function to handle new user creation
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 