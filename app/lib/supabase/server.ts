import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ 
    cookies: () => cookieStore 
  });
} 