// app/lib/services/admin.ts
import { getSupabaseClient } from '@/lib/supabase/client';
import { Database } from '@/app/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

export class AdminService {
  private static instance: AdminService;
  private supabase: SupabaseClient<Database>;

  private constructor() {
    this.supabase = getSupabaseClient();
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async checkAdminAccess(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  }

  async getAdminUsers() {
    const { data, error } = await this.supabase
      .from('admin_users')
      .select('*');

    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }

    return data;
  }

  async addAdminUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('admin_users')
      .insert({ user_id: userId });

    if (error) {
      console.error('Error adding admin user:', error);
      throw error;
    }
  }
}

// Export singleton instance methods
export const checkAdminAccess = AdminService.getInstance().checkAdminAccess.bind(AdminService.getInstance());
export const getAdminUsers = AdminService.getInstance().getAdminUsers.bind(AdminService.getInstance());
export const addAdminUser = AdminService.getInstance().addAdminUser.bind(AdminService.getInstance()); 