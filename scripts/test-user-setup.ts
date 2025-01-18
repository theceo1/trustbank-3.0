import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const log = debug('test:user-setup');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const QUIDAX_API_URL = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
const QUIDAX_SECRET_KEY = process.env.QUIDAX_SECRET_KEY!;

async function createQuidaxAccount(params: { 
  email: string; 
  first_name: string; 
  last_name: string; 
}) {
  try {
    const response = await fetch(`${QUIDAX_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Quidax account');
    }

    const { data: quidaxUser } = await response.json();
    return quidaxUser.id;
  } catch (error) {
    console.error('Error creating Quidax account:', error);
    throw error;
  }
}

async function createTestUser() {
  try {
    const uniqueEmail = `test${Date.now()}@trustbank.tech`;
    console.log('Creating test user with email:', uniqueEmail);

    // Create user with Google OAuth-like data
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: uniqueEmail,
      password: 'Test123!@#',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        first_name: 'Test',
        last_name: 'User'
      }
    });

    if (authError) throw authError;
    console.log('✓ Auth user created:', authUser.user.id);

    // Wait for trigger to create user and profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create Quidax account
    console.log('Creating Quidax account...');
    const quidaxId = await createQuidaxAccount({
      email: uniqueEmail,
      first_name: 'Test',
      last_name: 'User'
    });
    console.log('✓ Quidax account created:', quidaxId);

    // Update user profile with Quidax ID and KYC status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        quidax_id: quidaxId,
        kyc_level: 1,
        kyc_status: 'approved',
        is_verified: true,
        daily_limit: 100000,
        monthly_limit: 2000000
      })
      .eq('user_id', authUser.user.id);

    if (updateError) throw updateError;
    console.log('✓ Profile updated with Quidax ID and KYC status');

    console.log('\nTest user setup completed successfully!');
    console.log('Email:', uniqueEmail);
    console.log('Password: Test123!@#');
    console.log('Quidax ID:', quidaxId);

  } catch (error) {
    console.error('Error setting up test user:', error);
    process.exit(1);
  }
}

createTestUser(); 