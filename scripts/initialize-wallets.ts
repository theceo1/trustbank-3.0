import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function initializeWallets() {
  try {
    console.log('🔧 Initializing wallets for users...');

    // Get all users without wallets
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError) throw usersError;

    // Create NGN wallet for each user
    for (const user of users!) {
      const { error } = await supabase
        .from('wallets')
        .upsert({
          user_id: user.id,
          currency: 'NGN',
          balance: 0,
          pending_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0,
          is_test: false
        }, {
          onConflict: 'user_id,currency'
        });

      if (error) {
        console.error(`Error creating wallet for user ${user.id}:`, error);
      }
    }

    console.log('✅ Wallets initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize wallets:', error);
    process.exit(1);
  }
}

initializeWallets(); 