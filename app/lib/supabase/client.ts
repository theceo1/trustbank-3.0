import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
}

export default getSupabaseClient(); 