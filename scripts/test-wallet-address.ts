import { QuidaxClient } from '../app/lib/services/quidax-client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY!);

async function getOrCreateWalletAddress(userId: string, currency: string) {
  console.log(`\nFetching ${currency.toUpperCase()} wallet address...`);
  const response = await quidaxClient.getDepositAddress(userId, currency);
  console.log(`${currency.toUpperCase()} wallet address response:`, response);

  if (!response.data.address) {
    console.log(`No ${currency.toUpperCase()} address found, creating one...`);
    const newAddress = await quidaxClient.getDepositAddress(userId, currency);
    console.log(`Created new ${currency.toUpperCase()} address:`, newAddress);
    return newAddress;
  }

  return response;
}

async function testWalletAddresses() {
  try {
    console.log('Starting test...');

    // Get user's profile
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      throw authError;
    }

    const user = users.users.find(u => u.email === 'test1735848851306@trustbank.tech');
    if (!user) {
      throw new Error('User not found');
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    // Get user's Quidax ID from profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!profile?.quidax_id) {
      throw new Error('No Quidax ID found for user');
    }

    console.log('Found Quidax ID:', profile.quidax_id);

    // Test fetching/creating wallet addresses
    await getOrCreateWalletAddress(profile.quidax_id, 'btc');
    await getOrCreateWalletAddress(profile.quidax_id, 'eth');
    await getOrCreateWalletAddress(profile.quidax_id, 'usdt');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testWalletAddresses().catch(console.error); 