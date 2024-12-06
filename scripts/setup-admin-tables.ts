// scripts/setup-admin-tables.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('admin:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAdminTables() {
  let client;
  try {
    log(' Starting admin tables setup...');
    
    client = await pool.connect();
    log('✓ Database connection successful');

    // Create admin tables
    log('Creating admin tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.admin_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text UNIQUE NOT NULL,
        permissions jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        role_id uuid REFERENCES public.admin_roles(id),
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        UNIQUE(user_id)
      );

      CREATE TABLE IF NOT EXISTS public.admin_access_cache (
        user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        is_admin boolean DEFAULT false,
        permissions jsonb DEFAULT '{}',
        last_checked timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.admin_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) UNIQUE,
        full_name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    log('✓ Admin tables created');

    // Create initial admin user
    log('Creating initial admin user...');
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'admin001@trustbank.tech',
      password: 'SecureAdminPass123!',
      email_confirm: true,
      user_metadata: {
        is_super_admin: true
      }
    });

    if (userError) {
      throw userError;
    }
    log('✓ Admin user created');

    // Create super admin role
    log('Creating super admin role...');
    const { rows: [role] } = await client.query(`
      INSERT INTO public.admin_roles (name, permissions)
      VALUES ('super_admin', '{"all": true, "manage_users": true, "manage_roles": true, "manage_settings": true, "view_analytics": true, "manage_transactions": true, "manage_kyc": true, "manage_support": true}')
      ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions
      RETURNING id;
    `);
    log('✓ Super admin role created');

    // Link user to role
    log('Linking admin user to role...');
    await client.query(`
      INSERT INTO public.admin_users (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id;
    `, [user.user.id, role.id]);
    log('✓ Admin user linked to role');

    // Update admin access cache
    log('Updating admin access cache...');
    await client.query(`
      INSERT INTO public.admin_access_cache (user_id, is_admin, permissions)
      VALUES ($1, true, $2)
      ON CONFLICT (user_id) DO UPDATE SET 
        is_admin = EXCLUDED.is_admin,
        permissions = EXCLUDED.permissions;
    `, [user.user.id, role.permissions]);
    log('✓ Admin access cache updated');

    log('\n�� Admin setup completed successfully');
    log('\nLogin credentials:');
    log('Email: admin001@trustbank.tech');
    log('Password: SecureAdminPass123!');

  } catch (error: any) {
    log('\n❌ Setup failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

setupAdminTables(); 