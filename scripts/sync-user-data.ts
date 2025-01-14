import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncUserData() {
  try {
    // Get user from auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Failed to list users:', authError);
      return;
    }

    const user = users.find(u => u.email === 'test1735848851306@trustbank.tech');
    if (!user) {
      console.error('User not found in auth.users');
      return;
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata
    });

    // Update user profile with correct data
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
        kyc_level: user.user_metadata.kyc_level || 0,
        kyc_status: user.user_metadata.kyc_level >= 1 ? 'verified' : 'pending',
        is_verified: user.user_metadata.kyc_level >= 1,
        daily_limit: user.user_metadata.kyc_level >= 1 ? 200000 : 50000,
        monthly_limit: user.user_metadata.kyc_level >= 1 ? 5000000 : 1000000,
        tier1_verified: user.user_metadata.kyc_level >= 1,
        tier1_verified_at: user.user_metadata.kyc_level >= 1 ? new Date().toISOString() : null,
        verification_status: user.user_metadata.kyc_level >= 1 ? 'verified' : 'pending'
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return;
    }

    console.log('Successfully updated user profile');

    // Verify the update
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch updated profile:', fetchError);
      return;
    }

    console.log('Updated profile:', {
      id: updatedProfile.id,
      user_id: updatedProfile.user_id,
      full_name: updatedProfile.full_name,
      email: updatedProfile.email,
      kyc_status: updatedProfile.kyc_status,
      kyc_level: updatedProfile.kyc_level,
      is_verified: updatedProfile.is_verified,
      daily_limit: updatedProfile.daily_limit,
      monthly_limit: updatedProfile.monthly_limit,
      tier1_verified: updatedProfile.tier1_verified,
      tier1_verified_at: updatedProfile.tier1_verified_at,
      verification_status: updatedProfile.verification_status
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

syncUserData().catch(console.error); 