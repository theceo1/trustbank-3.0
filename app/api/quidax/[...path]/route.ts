import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

async function handleRequest(request: Request, method: string) {
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
        redirectTo: '/profile/verification'
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

    // Build the Quidax API URL
    const url = new URL(request.url);
    const path = url.pathname.split('/').slice(3).join('/');
    const quidaxUrl = `${QUIDAX_API_URL}/${path}${url.search}`;

    // Forward the request to Quidax
    const response = await fetch(quidaxUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${QUIDAX_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      ...(method !== 'GET' && request.body ? { body: request.body } : {})
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Quidax API] Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'Failed to proxy request to Quidax'
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request: Request) {
  return handleRequest(request, 'GET');
}

export async function POST(request: Request) {
  return handleRequest(request, 'POST');
} 