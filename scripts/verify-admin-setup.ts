// scripts/verify-admin-setup.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('admin:verify');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdminSetup() {
  let client;
  try {
    log('🔍 Verifying admin setup...');
    
    // 1. Check admin tables
    client = await pool.connect();
    const tables = ['admin_roles', 'admin_users', 'admin_access_cache'];
    for (const table of tables) {
      const { rows } = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (rows[0].exists) {
        log(`✓ ${table} table exists`);
      } else {
        log(`✗ ${table} table missing`);
      }
    }

    // 2. Check super admin user
    const { data: adminUser, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const superAdmin = adminUser.users.find(u => u.email === 'admin001@trustbank.tech');
    if (superAdmin) {
      log('✓ Super admin user exists');
      log('Admin ID:', superAdmin.id);
    } else {
      log('✗ Super admin user missing');
    }

    // 3. Check admin role
    const { data: role } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('name', 'super_admin')
      .single();

    if (role) {
      log('✓ Super admin role exists');
      log('Role permissions:', role.permissions);
    } else {
      log('✗ Super admin role missing');
    }

    log('✨ Verification complete');

  } catch (error: any) {
    log('\n❌ Verification failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

verifyAdminSetup(); 