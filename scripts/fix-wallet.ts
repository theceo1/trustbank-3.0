// scripts/fix-wallet.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixWallets() {
  try {
    console.log('🔧 Fixing wallet entries...');

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    // Default currencies that should exist for each user
    const DEFAULT_CURRENCIES = ['NGN', 'BTC', 'ETH', 'USDT', 'USDC'];

    // Create wallet entries for each user and currency if they don't exist
    for (const user of users!) {
      for (const currency of DEFAULT_CURRENCIES) {
        const { error } = await supabase
          .from('wallets')
          .upsert({
            user_id: user.id,
            currency,
            balance: 0,
            pending_balance: 0,
            total_deposits: 0,
            total_withdrawals: 0
          }, {
            onConflict: 'user_id,currency'
          });

        if (error) {
          console.error(`Error creating wallet for user ${user.id}, currency ${currency}:`, error);
        }
      }
    }

    console.log('✅ Wallet entries fixed successfully');
  } catch (error) {
    console.error('❌ Failed to fix wallets:', error);
    process.exit(1);
  }
}

fixWallets();