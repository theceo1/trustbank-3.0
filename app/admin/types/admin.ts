export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export type AdminPermission = {
  canManageUsers: boolean;
  canManageAdmins: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canHandleSupport: boolean;
  canViewTransactions: boolean;
  canManageReferrals: boolean;
};

export const RolePermissions: Record<AdminRole, AdminPermission> = {
  super_admin: {
    canManageUsers: true,
    canManageAdmins: true,
    canViewReports: true,
    canManageSettings: true,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: true
  },
  admin: {
    canManageUsers: true,
    canManageAdmins: false,
    canViewReports: true,
    canManageSettings: false,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: true
  },
  moderator: {
    canManageUsers: true,
    canManageAdmins: false,
    canViewReports: false,
    canManageSettings: false,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: false
  },
  support: {
    canManageUsers: false,
    canManageAdmins: false,
    canViewReports: false,
    canManageSettings: false,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: false
  }
};

export interface AdminProfile {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: string[];
  created_at: string;
  updated_at: string;
} 