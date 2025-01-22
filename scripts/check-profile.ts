import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { QuidaxService } from '../app/lib/services/quidax';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Validate required environment variables
if (!process.env.QUIDAX_SECRET_KEY) {
  throw new Error('QUIDAX_SECRET_KEY is required');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase environment variables are required');
}

// Initialize Supabase client
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfile() {
  try {
    // Get user from auth.users
    const { data: { users }, error: authError } = await supabaseClient.auth.admin.listUsers();
    if (authError) {
      console.error('Failed to list users:', authError);
      return;
    }

    const user = users.find((u) => u.email === 'tony@trustbank.tech');
    if (!user) {
      console.error('User not found in auth.users');
      return;
    }

    console.log('\nAuth User Data:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      user_metadata: user.user_metadata
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      return;
    }

    console.log('\nUser Profile:', {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      kyc_status: profile.kyc_status,
      kyc_level: profile.kyc_level,
      is_verified: profile.is_verified,
      quidax_id: profile.quidax_id,
      referral_code: profile.referral_code,
      daily_limit: profile.daily_limit,
      monthly_limit: profile.monthly_limit,
      created_at: profile.created_at
    });

    // If no Quidax ID, create one
    if (!profile.quidax_id) {
      console.log('Creating Quidax account...');
      
      // Create sub-account with minimal required fields
      const uniqueEmail = `${(user.email as string).split('@')[0]}.${Date.now()}@trustbank.tech`;
      const quidaxUser = await QuidaxService.createSubAccount({
        email: uniqueEmail,
        first_name: profile.full_name?.split(' ')[0] || 'Anthony',
        last_name: profile.full_name?.split(' ').slice(1).join(' ') || 'O',
        country: 'NG'
      });

      if (!quidaxUser?.data?.id) {
        throw new Error('Failed to create Quidax account');
      }

      // Update profile with Quidax ID
      const { error: updateError } = await supabaseClient
        .from('user_profiles')
        .update({ quidax_id: quidaxUser.data.id })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update profile with Quidax ID:', updateError);
        return;
      }

      console.log('Successfully created Quidax account:', quidaxUser.data.id);
    } else {
      // Verify existing Quidax account
      const quidaxUser = await QuidaxService.getUser(profile.quidax_id);
      console.log('\nQuidax Account:', quidaxUser);

      // Get wallet balances
      const wallets = await QuidaxService.getWallets(profile.quidax_id);
      console.log('\nWallet Balances:', wallets);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProfile(); 