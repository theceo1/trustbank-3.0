import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyProfileTrigger() {
  try {
    console.log('Creating profile trigger...');

    // Create the function
    const createFunctionSQL = `
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
    `;

    // Create the trigger
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `;

    // Execute the SQL
    const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    if (functionError) throw functionError;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
    if (triggerError) throw triggerError;

    console.log('✓ Profile trigger created successfully');

    // Create profiles for existing users
    console.log('Creating profiles for existing users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    for (const user of users) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            is_verified: false,
            kyc_level: 0,
            kyc_status: 'pending',
            daily_limit: 50000,
            monthly_limit: 1000000,
            referral_stats: {
              totalReferrals: 0,
              activeReferrals: 0,
              totalEarnings: 0,
              pendingEarnings: 0
            },
            notification_settings: {
              email: { marketing: false, security: true, trading: true, news: false },
              push: { trading: true, security: true, price_alerts: true },
              sms: { security: true, trading: true }
            }
          }]);

        if (insertError) {
          console.error(`Failed to create profile for user ${user.id}:`, insertError);
        } else {
          console.log(`✓ Created profile for user ${user.id}`);
        }
      } else {
        console.log(`Profile already exists for user ${user.id}`);
      }
    }

    console.log('✓ All profiles created successfully');
  } catch (error) {
    console.error('Error applying profile trigger:', error);
    process.exit(1);
  }
}

applyProfileTrigger(); 