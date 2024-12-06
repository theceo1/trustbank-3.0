// scripts/setup-admin.ts
import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('admin:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ErrorWithDetails {
  code?: string;
  message?: string;
  details?: string;
  msg?: string;
}

interface AuthUserResponse extends User {
  email: string;
}

async function getOrCreateAuthUser(email: string, password: string): Promise<AuthUserResponse> {
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) throw listError;
  
  const existingUser = (users as AuthUserResponse[]).find(u => u.email === email);
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

  return user as AuthUserResponse;
}

async function setupAdmin() {
  try {
    console.log('Starting admin setup...');
    
    // Try to get existing user first
    console.log('Checking for existing user...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin001@trustbank.tech')
      .single();

    let userId = existingUser?.id;

    if (!userId) {
      console.log('Creating new admin user...');
      const authUser = await getOrCreateAuthUser('admin001@trustbank.tech', 'SecureAdminPass123!');
      
      if (authUser) {
        userId = authUser.id;
        console.log('Created auth user with ID:', userId);

        // Create user in public schema
        console.log('Creating user record in public schema...');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: 'admin001@trustbank.tech',
            first_name: 'System',
            last_name: 'Administrator'
          });

        if (insertError) {
          console.error('Error creating public user record:', insertError);
          throw insertError;
        }
        console.log('Public user record created');
      } else {
        console.log('User already exists in auth system, fetching ID...');
        // Try to get the user ID from auth
        const { data: { user } } = await supabase.auth.admin.getUserById(userId!);
        if (!user?.id) throw new Error('Could not get existing user ID');
        userId = user.id;
      }
    }

    console.log('Using user ID:', userId);

    console.log('Creating/updating admin role...');
    const { data: roleData, error: roleError } = await supabase
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

    if (roleError) {
      console.error('Error creating/updating admin role:', roleError);
      throw roleError;
    }
    console.log('Admin role created/updated with ID:', roleData.id);

    console.log('Setting up admin user entry...');
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: userId,
        role_id: roleData.id,
        is_active: true
      }, {
        onConflict: 'user_id'
      });

    if (adminError) {
      console.error('Error creating admin user entry:', adminError);
      throw adminError;
    }
    console.log('Admin user entry created');

    console.log('Updating admin access cache...');
    const { error: cacheError } = await supabase
      .from('admin_access_cache')
      .upsert({
        user_id: userId,
        is_admin: true,
        permissions: roleData.permissions
      }, {
        onConflict: 'user_id'
      });

    if (cacheError) {
      console.error('Error updating admin access cache:', cacheError);
      throw cacheError;
    }
    console.log('Admin access cache updated');

    console.log('Creating admin profile...');
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .upsert({
        user_id: userId,
        full_name: 'System Administrator'
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      throw profileError;
    }
    console.log('Admin profile created');

    console.log('\nAdmin setup completed successfully');
    console.log('Login credentials:');
    console.log('Email: admin001@trustbank.tech');
    console.log('Password: SecureAdminPass123!');
    console.log('ADMIN_USER_ID:', userId);

  } catch (error: unknown) {
    console.error('\nSetup failed:', error);
    const err = error as ErrorWithDetails;
    if (err.code) console.error('Error code:', err.code);
    if (err.message) console.error('Error message:', err.message);
    if (err.details) console.error('Error details:', err.details);
    process.exit(1);
  }
}

// Log environment check
console.log('Environment check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

setupAdmin(); 