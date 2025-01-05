import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

let supabaseInstance: any = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient({
      options: {
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-application-name': 'trustbank'
          }
        }
      }
    });
  }
  return supabaseInstance;
}

export default getSupabaseClient(); 