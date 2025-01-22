import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/app/types/database';

let adminClient: ReturnType<typeof createClient<Database>>;
let browserClient: ReturnType<typeof createClientComponentClient<Database>>;

// For server-side operations (admin access)
export function getAdminClient() {
  if (!adminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey) {
      throw new Error('Supabase service role key not configured');
    }
    
    adminClient = createClient<Database>(supabaseUrl, supabaseKey);
  }
  return adminClient;
}

// For client-side operations (browser)
export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClientComponentClient<Database>();
  }
  return browserClient;
}

// Export the browser client by default
const supabase = getSupabaseClient();
export default supabase;

// Alias for backward compatibility
export const getClient = getSupabaseClient; 