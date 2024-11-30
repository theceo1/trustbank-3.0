import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>>;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>();
  }
  return supabaseInstance;
}

const supabase = getSupabaseClient();
export default supabase;