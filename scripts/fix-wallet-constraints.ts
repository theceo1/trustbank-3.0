import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixWalletConstraints() {
  try {
    console.log('🔧 Fixing wallet constraints...');

    // Drop and recreate wallets table using Supabase's REST API
    const { error: dropError } = await supabase.rpc('drop_and_recreate_wallets_table');
    
    if (dropError) {
      throw dropError;
    }

    console.log('✅ Wallet constraints fixed successfully');
  } catch (error) {
    console.error('❌ Failed to fix wallet constraints:', error);
    process.exit(1);
  }
}

fixWalletConstraints(); 