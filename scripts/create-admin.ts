// scripts/create-admin.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAdminTables() {
  try {
    // Get the existing admin role
    const { data: roleData, error: roleQueryError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    let adminRoleId;

    if (!roleData) {
      // Create admin role if it doesn't exist
      const { data: newRole, error: roleError } = await supabase
        .from('admin_roles')
        .insert([{
          name: 'admin',
          permissions: ['manage_users', 'view_reports', 'manage_settings']
        }])
        .select()
        .single();

      if (roleError) {
        console.error('Error creating admin role:', roleError);
        return;
      }
      adminRoleId = newRole.id;
    } else {
      adminRoleId = roleData.id;
    }

    // Create admin user entry
    const { error: userError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: process.env.ADMIN_USER_ID,
        role_id: adminRoleId,
        is_active: true
      }, {
        onConflict: 'user_id'
      });

    if (userError) {
      console.error('Error creating admin user:', userError);
      return;
    }

    // Update admin access cache
    const { error: cacheError } = await supabase
      .from('admin_access_cache')
      .upsert({
        user_id: process.env.ADMIN_USER_ID,
        is_admin: true,
        permissions: {
          can_manage_users: true,
          can_view_reports: true,
          can_manage_settings: true
        }
      }, {
        onConflict: 'user_id'
      });

    if (cacheError) {
      console.error('Error updating admin access cache:', cacheError);
      return;
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .upsert({
        user_id: process.env.ADMIN_USER_ID,
        full_name: 'System Administrator'
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
      return;
    }

    console.log('Admin setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdminTables();

export { setupAdminTables };