import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('fix:password');
debug.enable('fix:*');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixUserPassword() {
  try {
    log('🔧 Fixing user8 password...');
    
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      'a2ece631-7500-49da-bc12-e38a53f3584f', // user8's ID
      { password: 'SecureUserPass123!' }
    );

    if (error) throw error;
    
    log('✅ Password updated successfully');
    console.log('\nYou can now login with:');
    console.log('Email: user8@trustbank.tech');
    console.log('Password: SecureUserPass123!');
    
  } catch (error) {
    log('❌ Password update failed:', error);
    process.exit(1);
  }
}

fixUserPassword(); 