// /app/api/wallet/balance/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWalletService, getWalletService } from '@/app/lib/services/quidax-wallet';
import { APIError, handleApiError } from '@/app/lib/api-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new APIError('Authentication error', 401);
    }
    
    if (!session) {
      throw new APIError('Unauthorized', 401);
    }

    // Get the user's Quidax ID from their profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, kyc_status, kyc_level')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new APIError('Failed to fetch user profile', 500);
    }

    if (!userProfile) {
      throw new APIError('User profile not found', 404);
    }

    if (!userProfile.quidax_id) {
      throw new APIError('Quidax account not linked', 400);
    }

    // Check KYC status if needed
    if (userProfile.kyc_status !== 'verified' || !userProfile.kyc_level) {
      throw new APIError('KYC verification required', 403);
    }

    // Get the wallet balance from Quidax using their ID
    const walletService = getWalletService();
    const walletResponse = await walletService.getWallet(
      userProfile.quidax_id,
      'ngn'
    ).catch((error: Error & { status?: number }) => {
      console.error('Quidax wallet error:', error);
      throw new APIError(
        error.message || 'Failed to fetch Quidax wallet data',
        error.status || 500
      );
    });

    if (!walletResponse?.data) {
      throw new APIError('Invalid wallet data received', 500);
    }

    // Find the NGN wallet from the response
    const ngnWallet = Array.isArray(walletResponse.data) 
      ? walletResponse.data.find((w: { currency: string }) => w.currency.toLowerCase() === 'ngn')
      : walletResponse.data;

    if (!ngnWallet) {
      throw new APIError('NGN wallet not found', 404);
    }

    // Validate wallet data
    const balance = parseFloat(ngnWallet.balance || '0');
    const pending_balance = parseFloat(ngnWallet.pending_balance || '0');
    const total_deposits = parseFloat(ngnWallet.total_deposits || '0');
    const total_withdrawals = parseFloat(ngnWallet.total_withdrawals || '0');

    if (isNaN(balance) || isNaN(pending_balance) || isNaN(total_deposits) || isNaN(total_withdrawals)) {
      throw new APIError('Invalid wallet balance data', 500);
    }

    return NextResponse.json({
      status: "success",
      data: {
        currency: 'NGN',
        balance,
        pending_balance,
        total_deposits,
        total_withdrawals
      }
    });

  } catch (error) {
    console.error('Error fetching wallet:', error);
    return handleApiError(error);
  }
} 