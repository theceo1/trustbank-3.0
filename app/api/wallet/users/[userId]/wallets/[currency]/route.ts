//app/api/wallet/users/[userId]/wallets/[currency]/route.
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract userId and currency from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[4];
    const currency = pathParts[6];

    // Verify user is requesting their own wallet
    if (session.user.id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized to access this wallet' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the user's profile to check if they have access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_verified, quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile?.is_verified) {
      return new Response(JSON.stringify({
        error: 'KYC verification required',
        message: 'Please complete KYC verification to access this feature',
        redirectTo: '/kyc'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!profile?.quidax_id) {
      return new Response(JSON.stringify({ error: 'Quidax account not linked' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the user's wallets from Quidax
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    const wallets = await quidaxClient.fetchUserWallets(profile.quidax_id);

    // Find the requested currency wallet
    const wallet = wallets.data.find((w: any) => w.currency.toLowerCase() === currency.toLowerCase());

    if (!wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      status: 'success',
      data: wallet
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Wallet API] Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'Failed to fetch wallet data'
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 