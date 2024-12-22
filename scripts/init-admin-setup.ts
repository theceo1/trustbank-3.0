// This script is used to initialize the admin setup
// It creates the auth user, admin role, public user record, admin user entry, and updates the access cache

//scripts/init-admin-setup.ts
import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to create/get auth user
async function getOrCreateAuthUser(email: string, password: string): Promise<User> {
  const { data: { users } } = await supabase.auth.admin.listUsers() as {
    data: { users: User[] },
    error: null | {
      message: string;
      status: number;
    }
  };
  
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) return existingUser;

  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) throw error;
  if (!user) throw new Error('Failed to create auth user');
  
  return user;
}

async function initAdminSetup() {
  console.log('🔧 Initializing admin setup...\n');

  try {
    // 1. Create admin tables first
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Create admin tables
        CREATE TABLE IF NOT EXISTS admin_roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(50) NOT NULL UNIQUE,
          permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          role_id UUID NOT NULL REFERENCES admin_roles(id),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );

        CREATE TABLE IF NOT EXISTS admin_access_cache (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          is_admin BOOLEAN DEFAULT false,
          permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `);
      console.log('✅ Admin tables created');
    } finally {
      client.release();
    }

    // 2. Create/get auth user
    console.log('\nCreating/getting auth user...');
    const authUser = await getOrCreateAuthUser('admin001@trustbank.tech', 'SecureAdminPass123!');
    console.log('✅ Auth user ready:', authUser.id);

    // 3. Create admin role
    console.log('\nCreating admin role...');
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .upsert({
        name: 'super_admin',
        permissions: {
          all: true,
          manage_users: true,
          manage_roles: true,
          manage_settings: true,
          view_analytics: true,
          manage_transactions: true,
          manage_kyc: true,
          manage_support: true
        }
      }, {
        onConflict: 'name'
      })
      .select()
      .single();

    if (roleError) throw roleError;
    if (!role) throw new Error('Failed to create admin role');
    console.log('✅ Admin role created');

    // 4. Create admin user entry
    console.log('\nSetting up admin user...');
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: authUser.id,
        role_id: role.id,
        is_active: true
      }, {
        onConflict: 'user_id'
      });

    if (adminError) throw adminError;
    console.log('✅ Admin user entry created');

    // 5. Update admin access cache
    console.log('\nUpdating access cache...');
    const { error: cacheError } = await supabase
      .from('admin_access_cache')
      .upsert({
        user_id: authUser.id,
        is_admin: true,
        permissions: role.permissions
      }, {
        onConflict: 'user_id'
      });

    if (cacheError) throw cacheError;
    console.log('✅ Access cache updated');

    console.log('\n✨ Admin setup completed successfully');

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.details) console.error('Error details:', error.details);
    process.exit(1);
  }
}

initAdminSetup(); 