import supabaseClient from '@/lib/supabase/client';

export const getReferralCode = () => {
  // Get referral code from URL query parameters
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || '';
  }
  return '';
};

export function generateReferralCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code) return true;
  
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('referral_code')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error validating referral code:', error);
    return false;
  }

  return !!data && data.referral_code === code;
} 