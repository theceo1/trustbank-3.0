import { createClient } from '@supabase/supabase-js';
import { ProfileService } from '../app/lib/services/profile';
import { generateReferralCode } from '../app/utils/referral';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local instead of .env
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to check if user exists in auth.users table
async function checkUserExists(userId: string): Promise<boolean> {
  console.log('Checking if user exists:', userId);
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error) {
    console.log('Error checking user existence:', error);
    return false;
  }
  console.log('User exists check result:', !!data.user);
  return !!data.user;
}

async function createPublicUser(user: any) {
  console.log('Creating public user record...');
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      is_verified: user.email_confirmed_at ? true : false,
      kyc_level: 0,
      kyc_status: 'pending',
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('Failed to create public user:', insertError);
    return false;
  }
  console.log('Created public user record');
  return true;
}

async function testProfile() {
  try {
    // First get the test user
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test1735848851306@trustbank.tech',
      password: 'trustbank123'
    });

    if (authError) throw authError;
    console.log('Successfully authenticated user:', user?.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (profileError) throw profileError;
    console.log('User Profile:', profile);

    // Generate and store referral code if none exists
    if (!profile.referral_code) {
      const referralCode = generateReferralCode();
      console.log('Generating new referral code:', referralCode);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          referral_code: referralCode,
          referral_stats: {
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarnings: 0,
            pendingEarnings: 0
          }
        })
        .eq('user_id', user?.id);
        
      if (updateError) throw updateError;
      console.log('Successfully stored referral code');
      
      // Fetch updated profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (fetchError) throw fetchError;
      console.log('Updated Profile:', updatedProfile);
    }

    // Create referred user
    console.log('Creating referred user...');
    const email = `referred_${Date.now()}@test.com`;
    const { data: referredUser, error: referredError } = await supabase.auth.signUp({
      email,
      password: 'trustbank123',
      options: {
        data: {
          email,
          email_verified: true,
          full_name: 'Referred User',
          phone_verified: false
        }
      }
    });

    if (referredError || !referredUser || !referredUser.user) {
      console.error('Error creating referred user:', referredError);
      return;
    }

    const referredUserId = referredUser.user.id;
    console.log('Created referred user:', referredUser);
    console.log('Creating public user record for referred user...');
    const success = await createPublicUser(referredUser.user);
    if (!success) {
      console.error('Failed to create public user record for referred user');
      return;
    }

    // Create profile for referred user with retries and user existence check
    console.log('Waiting for user to be propagated...');
    let retryCount = 0;
    const maxRetries = 5;
    let referredProfile = null;

    while (retryCount < maxRetries) {
      try {
        console.log(`Waiting 5 seconds before attempt ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if user exists before creating profile
        console.log(`Checking if user exists: ${referredUserId}`);
        const userExists = await checkUserExists(referredUserId);
        console.log('User exists check result:', userExists);

        if (!userExists) {
          console.log('User does not exist in auth.users table');
          retryCount++;
          continue;
        }

        console.log('User exists, attempting to create profile...');
        referredProfile = await ProfileService.createProfile(referredUserId, email);
        console.log('Created referred user profile:', referredProfile);
        break;
      } catch (error) {
        console.log(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          console.error('Error creating referred user profile after all retries:', error);
          return;
        }
      }
    }

    // Update profile with referral code if successful
    if (referredProfile) {
      try {
        const updatedProfile = await ProfileService.updateProfile(referredUserId, {
          referred_by: profile.referral_code
        });
        console.log('Updated referred user profile:', updatedProfile);
      } catch (error) {
        console.error('Error updating referred user profile:', error);
      }
    }

    // Check referral stats
    if (profile.referral_code) {
      const { data: referrals, error: referralError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('referred_by', profile.referral_code);

      if (referralError) throw referralError;
      console.log('Referral Count:', referrals?.length || 0);
      console.log('Referrals:', referrals);
    }

  } catch (error) {
    console.error('Error in test profile:', error);
  }
}

testProfile();