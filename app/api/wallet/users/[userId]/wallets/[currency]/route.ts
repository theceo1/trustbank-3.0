//app/api/wallet/users/[userId]/wallets/[currency]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxWalletService, getWalletService } from '@/app/lib/services/quidax-wallet';
import { APIError, handleApiError } from '@/app/lib/api-utils';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; currency: string } }
) {
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

    // Verify user is requesting their own wallet
    if (session.user.id !== params.userId) {
      throw new APIError('Unauthorized to access this wallet', 403);
    }

    // Get the user's Quidax ID from their profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, is_verified')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new APIError('Failed to fetch user profile', 500);
    }

    if (!userProfile?.quidax_id) {
      throw new APIError('Quidax account not linked', 400);
    }

    if (!userProfile.is_verified) {
      return NextResponse.json({
        error: 'KYC verification required',
        message: 'Please complete KYC verification to access this feature',
        redirectTo: '/kyc'
      }, { status: 403 });
    }

    // Initialize wallet service and fetch the wallet
    const walletService = getWalletService();
    try {
      const walletResponse = await walletService.getWallet(
        userProfile.quidax_id,
        params.currency.toLowerCase()
      );

      return NextResponse.json({
        status: 'success',
        data: walletResponse.data[0]
      });
    } catch (error: any) {
      console.error('Error fetching wallet from Quidax:', error);
      if (error.message === 'Request timeout') {
        throw new APIError('The request to fetch wallet data timed out. Please try again.', 504);
      }
      throw new APIError(error.message || 'Failed to fetch wallet details', error.status || 500);
    }
  } catch (error: any) {
    return handleApiError(error);
  }
} 