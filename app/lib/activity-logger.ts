import supabase from "./supabase/client";
import { ActivityType } from "@/app/types/activity";

interface LogActivityParams {
  userId: string;
  type: ActivityType;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logUserActivity({
  userId,
  type,
  action,
  metadata = {},
  ipAddress,
  userAgent
}: LogActivityParams) {
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        type,
        action,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Optionally report to error tracking service
  }
}

// Helper functions for common activities
export const ActivityLogger = {
  auth: {
    login: (userId: string, metadata?: Record<string, any>) =>
      logUserActivity({
        userId,
        type: 'auth',
        action: 'User logged in',
        metadata
      }),
    logout: (userId: string) =>
      logUserActivity({
        userId,
        type: 'auth',
        action: 'User logged out'
      }),
    passwordReset: (userId: string) =>
      logUserActivity({
        userId,
        type: 'auth',
        action: 'Password reset requested'
      })
  },
  profile: {
    update: (userId: string, metadata: Record<string, any>) =>
      logUserActivity({
        userId,
        type: 'profile',
        action: 'Profile updated',
        metadata
      }),
    verify: (userId: string) =>
      logUserActivity({
        userId,
        type: 'profile',
        action: 'Profile verified'
      })
  },
  security: {
    mfaEnabled: (userId: string) =>
      logUserActivity({
        userId,
        type: 'security',
        action: 'MFA enabled'
      }),
    mfaDisabled: (userId: string) =>
      logUserActivity({
        userId,
        type: 'security',
        action: 'MFA disabled'
      }),
    deviceAuthorized: (userId: string, metadata: Record<string, any>) =>
      logUserActivity({
        userId,
        type: 'security',
        action: 'New device authorized',
        metadata
      })
  },
  transaction: {
    created: (userId: string, metadata: Record<string, any>) =>
      logUserActivity({
        userId,
        type: 'transaction',
        action: 'Transaction created',
        metadata
      }),
    statusUpdate: (userId: string, metadata: Record<string, any>) =>
      logUserActivity({
        userId,
        type: 'transaction',
        action: 'Transaction status updated',
        metadata
      })
  }
}; 