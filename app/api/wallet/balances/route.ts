import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';
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
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new APIError('Failed to fetch user profile', 500);
    }

    if (!userProfile?.quidax_id) {
      throw new APIError('Quidax account not linked', 400);
    }

    // Initialize Quidax client with increased timeout
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    
    try {
      // Fetch all wallets for the user
      const walletsResponse = await quidaxClient.fetchUserWallets(userProfile.quidax_id);
      
      if (!walletsResponse || !walletsResponse.data) {
        throw new APIError('Invalid response from Quidax API', 500);
      }

      // Return the wallets array directly as the data
      return NextResponse.json({
        status: "success",
        message: "Wallets fetched successfully",
        data: walletsResponse.data
      });
    } catch (error: any) {
      console.error('Quidax API error:', error);
      if (error.name === 'AbortError' || error.cause?.name === 'ConnectTimeoutError') {
        throw new APIError('Connection timeout while fetching wallet data', 504);
      }
      throw new APIError(error.message || 'Failed to fetch wallet data', 500);
    }

  } catch (error) {
    console.error('Error fetching wallets:', error);
    return handleApiError(error);
  }
} 