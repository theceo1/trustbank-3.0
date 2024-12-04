// This script is used to initialize the admin setup
// It creates the auth user, admin role, public user record, admin user entry, and updates the access cache

//scripts/init-admin-setup.ts
// import { PrismaClient } from '@prisma/client';
import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Using the tested getOrCreateAuthUser function from setup-admin.ts
async function getOrCreateAuthUser(email: string, password: string): Promise<User> {
  // First try to get the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) throw listError;
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return existingUser;
  }

  // If user doesn't exist, create them
  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      is_admin: true
    }
  });

  if (createError) throw createError;
  if (!user) throw new Error('User creation failed');

  return user;
}

async function initAdminSetup() {
  console.log('🔧 Initializing admin setup...\n');

  try {
    // 1. Create auth user first
    console.log('Creating/getting auth user...');
    const authUser = await getOrCreateAuthUser('admin001@trustbank.tech', 'SecureAdminPass123!');
    console.log('✅ Auth user ready:', authUser.id);

    // 2. Create admin role using Prisma
    console.log('\nCreating admin role...');
    const role = await supabase.from('admin_role').upsert({
      where: { name: 'super_admin' },
      update: {},
      create: {
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
      }
    });
    console.log('✅ Admin role created');

    // 3. Create public user record
    console.log('\nCreating public user record...');
    await supabase.from('user').upsert({
      where: { id: authUser.id },
      update: {
        email: 'admin001@trustbank.tech',
        first_name: 'System',
        last_name: 'Administrator'
      },
      create: {
        id: authUser.id,
        email: 'admin001@trustbank.tech',
        first_name: 'System',
        last_name: 'Administrator'
      }
    });
    console.log('✅ Public user record created');

    // 4. Create admin user entry
    console.log('\nSetting up admin user...');
    await supabase.from('admin_user').upsert({
      where: { user_id: authUser.id },
      update: {
        role_id: role.id,
        is_active: true
      },
      create: {
        user_id: authUser.id,
        role_id: role.id,
        is_active: true
      }
    });
    console.log('✅ Admin user entry created');

    // 5. Update admin access cache
    console.log('\nUpdating access cache...');
    const permissions = role.permissions as Record<string, boolean>;
    await supabase.from('admin_access_cache').upsert({
      where: { user_id: authUser.id },
      update: {
        is_admin: true,
        permissions: permissions
      },
      create: {
        user_id: authUser.id,
        is_admin: true,
        permissions: permissions
      }
    });
    console.log('✅ Access cache updated');

    console.log('\n✨ Admin setup completed successfully');
    console.log('\nLogin credentials:');
    console.log('Email: admin001@trustbank.tech');
    console.log('Password: SecureAdminPass123!');
    console.log('Admin ID:', authUser.id);

  } catch (error: any) {
    console.error('\n❌ Setup failed:', error);
    if (error.code) console.error('Error code:', error.code);
    if (error.message) console.error('Error message:', error.message);
    if (error.details) console.error('Error details:', error.details);
    process.exit(1);
  }
}

initAdminSetup(); 