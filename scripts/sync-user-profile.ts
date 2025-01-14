import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUserProfile() {
  try {
    const email = 'test1735848851306@trustbank.tech';
    console.log('Syncing profile for user:', email);

    // Get user from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found in auth.users');
    }

    console.log('Found user:', user.id);

    // Delete existing profile if any
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting existing profile:', deleteError);
    }

    // Create new profile with all required fields
    const { data: profile, error: createError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Test User',
        is_verified: false,
        kyc_level: 0,
        kyc_status: 'pending',
        daily_limit: 50000,
        monthly_limit: 1000000,
        avatar_url: user.user_metadata?.avatar_url || null,
        country: user.user_metadata?.country || 'NG',
        phone: user.phone || user.user_metadata?.phone || null,
        referral_code: `TB${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
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
      }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log('✓ Profile created successfully:', profile);

  } catch (error) {
    console.error('Error syncing profile:', error);
    process.exit(1);
  }
}

syncUserProfile(); 