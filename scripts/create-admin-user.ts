import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import debug from 'debug';

const log = debug('admin:create-user');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createAdminUser() {
  log('Starting admin user creation...');
  try {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: 'admin001@trustbank.tech',
      password: 'SecureAdminPass123!',
      email_confirm: true,
      user_metadata: {
        is_admin: true
      }
    });

    if (error) {
      log('Error creating admin user:', error);
      throw error;
    }
    
    log('Admin user created successfully');
    log('ADMIN_USER_ID:', user?.id);
    console.log('\nPlease add this ID to your .env.local file:');
    console.log(`ADMIN_USER_ID=${user?.id}\n`);
    
  } catch (error) {
    log('Creation failed:', error);
    process.exit(1);
  }
}

createAdminUser();