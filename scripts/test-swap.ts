import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { QuidaxSwapService } from '../app/lib/services/quidax-swap';
import { createClient } from '@supabase/supabase-js';

async function testSwap() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Sign in with test credentials
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test1735848851306@trustbank.tech',
      password: 'trustbank123'
    });

    if (signInError) {
      throw new Error(`Sign in failed: ${signInError.message}`);
    }

    if (!user) {
      throw new Error('No user returned after sign in');
    }

    console.log('Successfully signed in:', user.email);

    // Get user's Quidax ID
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    if (!profile?.quidax_id) {
      throw new Error('No Quidax ID found for user');
    }

    console.log('Found Quidax ID:', profile.quidax_id);

    // Create swap quotation (0.28 USDT to BTC - half of available balance)
    const quotation = await QuidaxSwapService.createSwapQuotation({
      user_id: profile.quidax_id,
      from_currency: 'USDT',
      to_currency: 'BTC',
      from_amount: '0.28'
    });

    console.log('Received quotation:', quotation);

    // Confirm the swap
    const swap = await QuidaxSwapService.confirmSwap(
      profile.quidax_id,
      quotation.data.id
    );

    console.log('Swap confirmed:', swap);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testSwap(); 