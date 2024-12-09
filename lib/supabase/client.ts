// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>>;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>({
      cookieOptions: {
        name: 'sb-auth-token',
        domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      }
    });
  }
  return supabaseInstance;
}

const supabase = getSupabaseClient();

export default supabase;

export const createNewSupabaseClient = () => createClientComponentClient<Database>();
