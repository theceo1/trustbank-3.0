// app/lib/services/admin.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

interface AdminRole {
  permissions: Record<string, string[]>;
}

interface AdminDataResponse {
  is_active: boolean;
  admin_roles: {
    permissions: Record<string, string[]>;
  }[];
}

export class AdminService {
  private static supabase = createClientComponentClient<Database>();

  static async checkAdminAccess(userId: string) {
    try {
      // First check the cache
      const { data: cacheData, error: cacheError } = await this.supabase
        .from('admin_access_cache')
        .select('is_admin, permissions')
        .eq('user_id', userId)
        .single();

      // If valid cache entry exists, return it
      if (cacheData) {
        return {
          isAdmin: cacheData.is_admin,
          permissions: cacheData.permissions as Record<string, Record<string, boolean>>
        };
      }

      // If no cache or error, check admin_users table
      const { data: adminData, error: adminError } = await this.supabase
        .from('admin_users')
        .select(`
          is_active,
          admin_roles (
            permissions
          )
        `)
        .eq('user_id', userId)
        .single();

      const isAdmin = adminData?.is_active ?? false;
      const permissions = adminData?.admin_roles?.[0]?.permissions ?? {};

      // Update cache
      await this.supabase
        .from('admin_access_cache')
        .upsert({
          user_id: userId,
          is_admin: isAdmin,
          permissions: permissions,
          last_checked: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      return { isAdmin, permissions };
    } catch (error) {
      console.error('Admin access check error:', error);
      return { isAdmin: false, permissions: {} };
    }
  }
} 