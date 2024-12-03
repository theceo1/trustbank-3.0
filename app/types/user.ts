export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string;
  metadata?: Record<string, any>;
} 