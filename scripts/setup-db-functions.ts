import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupDbFunctions() {
  try {
    console.log('🔧 Setting up database functions...');

    // Create the wallet management function
    const { error: functionError } = await supabase.rpc('create_wallet_management_functions');

    if (functionError) {
      throw functionError;
    }

    console.log('✅ Database functions created successfully');
  } catch (error) {
    console.error('❌ Failed to setup database functions:', error);
    process.exit(1);
  }
}

setupDbFunctions(); 