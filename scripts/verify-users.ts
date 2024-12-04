import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('users:verify');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyUsers() {
  try {
    log('🔍 Verifying users setup...');

    // Check auth users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // Check admin user
    const adminUser = users.find(u => u.email === 'admin001@trustbank.tech');
    if (adminUser) {
      log('✓ Admin auth user exists');
      log('Admin metadata:', adminUser.user_metadata);
    } else {
      log('✗ Admin user missing');
    }

    // Check regular user
    const regularUser = users.find(u => u.email === 'user001@trustbank.tech');
    if (regularUser) {
      log('✓ Regular auth user exists');
      log('Regular user metadata:', regularUser.user_metadata);
    } else {
      log('✗ Regular user missing');
    }

    // Check public profiles
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('*')
      .in('email', ['admin001@trustbank.tech', 'user001@trustbank.tech']);
    
    if (profileError) throw profileError;

    log('\nPublic profiles:');
    profiles.forEach(profile => {
      log(`✓ Profile for ${profile.email}`);
      log('Profile data:', profile);
    });

    // Check admin role assignment
    if (adminUser) {
      const { data: adminRole } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', adminUser.id)
        .single();

      if (adminRole) {
        log('\n✓ Admin role assigned correctly');
      } else {
        log('\n✗ Admin role assignment missing');
      }
    }

    log('\n✨ Verification complete');

  } catch (error: any) {
    log('\n❌ Verification failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  }
}

verifyUsers(); 