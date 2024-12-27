import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 10000; // 10 seconds
const MAX_RETRIES = 2;

export async function refreshSessionWithBackoff(attempt = 1) {
  const supabase = createClientComponentClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      if (error.message.includes('rate limit') && attempt < MAX_RETRIES) {
        const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY);
        await new Promise(resolve => setTimeout(resolve, delay));
        return refreshSessionWithBackoff(attempt + 1);
      }
      
      // Clear cookies on refresh token errors
      if (error.message.includes('Refresh Token')) {
        await supabase.auth.signOut();
      }
      
      throw error;
    }
    
    return session;
  } catch (error) {
    console.error('Session refresh error:', error);
    throw error;
  }
}

export async function refreshSession() {
  try {
    const session = await refreshSessionWithBackoff();
    return { session, error: null };
  } catch (error) {
    return { session: null, error };
  }
} 