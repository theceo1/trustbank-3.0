import supabaseClient from '@/lib/supabase/client';

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
  return `TB${timestamp}${random}`;
}

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code) return true;
  
  const { data, error } = await supabaseClient
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