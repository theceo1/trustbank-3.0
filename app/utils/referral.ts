import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient>;

function getClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

export const getReferralCode = () => {
  // Get referral code from URL query parameters
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || '';
  }
  return '';
};

export function generateReferralCode(): string {
  // Format: TB + timestamp (base36) + 8 random chars
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const extra = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TB${timestamp}${random}${extra}`;
}

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code) return true;
  
  const { data, error } = await getClient()
    .from('user_profiles')
    .select('referral_code')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error validating referral code:', error);
    return false;
  }

  return !!data && data.referral_code === code;
}