// scripts/create-admin-user.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import debug from 'debug';
import crypto from 'crypto';

const log = debug('admin:create-user');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateReferralCode(length = 8): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

async function createAdminUser() {
  log('Starting admin user creation...');
  try {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: 'admin001@trustbank.tech',
      password: 'SecureAdminPass123!',
      email_confirm: true,
      user_metadata: {
        is_super_admin: true,
        permissions: {
          all: true,
          manage_users: true,
          manage_roles: true,
          manage_settings: true,
          view_analytics: true,
          manage_transactions: true,
          manage_kyc: true,
          manage_support: true
        }
      }
    });

    if (error) throw error;
    if (!user) throw new Error('Admin user creation failed');

    // Create admin profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: 'admin001@trustbank.tech',
        first_name: 'System',
        last_name: 'Administrator',
        is_verified: true,
        kyc_level: 3,
        kyc_status: 'approved'
      });

    if (profileError) throw profileError;

    // Create admin user_profile
    const referralCode = generateReferralCode();
    const { error: userProfileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        kyc_tier: 'tier3',
        kyc_verified: true
      });

    if (userProfileError) throw userProfileError;

    // Create admin role and link
    const { error: adminRoleError } = await supabase
      .from('admin_roles')
      .insert({
        name: 'super_admin',
        permissions: {
          all: true,
          manage_users: true,
          manage_roles: true,
          manage_settings: true,
          view_analytics: true,
          manage_transactions: true,
          manage_kyc: true,
          manage_support: true
        }
      })
      .select()
      .single();

    if (adminRoleError && adminRoleError.code !== '23505') { // Ignore unique violation
      throw adminRoleError;
    }

    log('Admin user created successfully');
    log('ADMIN_USER_ID:', user.id);
    console.log('\nPlease add this ID to your .env.local file:');
    console.log(`ADMIN_USER_ID=${user.id}\n`);
    
  } catch (error) {
    log('Creation failed:', error);
    process.exit(1);
  }
}

createAdminUser();