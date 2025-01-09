// /app/api/wallet/[userId]/route.ts
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

    return new Response(JSON.stringify({
      status: 'success',
      data: wallets
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