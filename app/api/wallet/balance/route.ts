// /app/api/wallet/balance/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';
import { APIError, handleApiError } from '@/app/lib/api-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

type UserProfileResponse = {
  quidax_id: string;
}

export async function GET() {
  try {
    if (!QUIDAX_CONFIG.apiKey) {
      throw new APIError('Quidax API key not configured', 500);
    }

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
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single<UserProfileResponse>();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new APIError('Failed to fetch user profile', 500);
    }

    if (!userProfile?.quidax_id) {
      console.error('No Quidax ID found for user');
      throw new APIError('Account setup incomplete', 500);
    }

    // Initialize Quidax client
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    
    try {
      // Fetch all wallets for the user's sub-account
      const walletsResponse = await quidaxClient.fetchUserWallets(userProfile.quidax_id);
      
      if (!walletsResponse?.data) {
        throw new APIError('Invalid response from Quidax API', 500);
      }

      const wallets = Array.isArray(walletsResponse.data) ? walletsResponse.data : [walletsResponse.data];

      // Calculate total balance across all wallets
      const totalBalance = wallets.reduce((acc, wallet) => {
        const balance = parseFloat(wallet.balance || '0');
        return isNaN(balance) ? acc : acc + balance;
      }, 0);

      return NextResponse.json({
        status: "success",
        data: {
          total_balance: totalBalance.toFixed(8),
          wallets: wallets.map(wallet => ({
            ...wallet,
            balance: wallet.balance || '0',
            locked: wallet.locked || '0',
            total: wallet.total || '0'
          }))
        }
      });
    } catch (error: any) {
      console.error('Quidax API error:', error);
      if (error.name === 'AbortError' || error.cause?.name === 'ConnectTimeoutError') {
        throw new APIError('Connection timeout while fetching wallet data', 504);
      }
      // Check for specific Quidax API errors
      if (error.response?.status === 404) {
        throw new APIError('Wallet not found', 404);
      }
      if (error.response?.status === 400) {
        throw new APIError('Invalid wallet request', 400);
      }
      throw new APIError(error.message || 'Failed to fetch wallet data', 500);
    }

  } catch (error) {
    console.error('Error fetching wallet:', error);
    return handleApiError(error);
  }
} 