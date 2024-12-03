// scripts/setup-super-admin.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupSuperAdmin() {
  try {
    // Create super admin role
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

    if (roleError) throw roleError;

    // Get admin user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin001@trustbank.tech')
      .single();

    if (userError) throw userError;

    // Assign super admin role
    await supabase
      .from('admin_users')
      .upsert({
        user_id: userData.id,
        role_id: roleData.id,
        is_active: true
      }, {
        onConflict: 'user_id'
      });

    // Update access cache
    await supabase
      .from('admin_access_cache')
      .upsert({
        user_id: userData.id,
        is_admin: true,
        permissions: roleData.permissions
      }, {
        onConflict: 'user_id'
      });

    console.log('Super admin setup completed successfully');
  } catch (error) {
    console.error('Error setting up super admin:', error);
  }
}

setupSuperAdmin();