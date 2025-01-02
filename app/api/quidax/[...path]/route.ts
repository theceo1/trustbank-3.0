import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the user session
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's profile to check if they have access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_verified, quidax_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_verified) {
      return NextResponse.json({
        error: 'KYC verification required',
        message: 'Please complete KYC verification to access this feature',
        redirectTo: '/kyc'
      }, { status: 403 });
    }

    if (!profile?.quidax_id) {
      return NextResponse.json({ error: 'Quidax account not linked' }, { status: 400 });
    }

    // Build the Quidax API URL
    const path = params.path.join('/');
    const url = new URL(request.url);
    const quidaxUrl = `${QUIDAX_API_URL}/${path}${url.search}`;

    // Forward the request to Quidax
    const response = await fetch(quidaxUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Quidax API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quidax proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the user session
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's profile to check if they have access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_verified, quidax_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_verified) {
      return NextResponse.json({
        error: 'KYC verification required',
        message: 'Please complete KYC verification to access this feature',
        redirectTo: '/kyc'
      }, { status: 403 });
    }

    if (!profile?.quidax_id) {
      return NextResponse.json({ error: 'Quidax account not linked' }, { status: 400 });
    }

    // Build the Quidax API URL
    const path = params.path.join('/');
    const quidaxUrl = `${QUIDAX_API_URL}/${path}`;

    // Forward the request to Quidax
    const body = await request.json();
    const response = await fetch(quidaxUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Quidax API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quidax proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 