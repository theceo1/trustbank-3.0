import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkKYCStatus() {
  try {
    // Get user's auth data
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Failed to list users:', authError);
      return;
    }

    const user = users.find(u => u.email === 'test1735848851306@trustbank.tech');
    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      return;
    }

    console.log('User profile:', profile);

    // Check KYC status
    if (!profile.is_verified || profile.verification_status !== 'verified') {
      console.log('User is not KYC verified. Updating status...');

      // Update user's KYC status
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          is_verified: true,
          kyc_status: 'verified',
          kyc_level: 1,
          verification_status: 'verified',
          tier1_verified: true,
          tier1_verified_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update KYC status:', updateError);
        return;
      }

      console.log('Updated KYC status to verified');
    } else {
      console.log('User is already KYC verified');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkKYCStatus().catch(console.error); 