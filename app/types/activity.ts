export type ActivityType = 'auth' | 'transaction' | 'profile' | 'security' | 'system';

export interface ActivityLog {
  id: string;
  user_id: string;
  type: ActivityType;
  action: string;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
} 