// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>>;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>();
  }
  return supabaseInstance;
}

// Export a default instance for convenience
export default getSupabaseClient();