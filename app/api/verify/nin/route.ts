import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

const DOJAH_API_URL = 'https://api.dojah.io/api/v1/kyc/nin/verify';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nin, selfie_image } = body;

    if (!nin || !selfie_image) {
      return NextResponse.json({ 
        error: 'NIN and selfie image are required' 
      }, { status: 400 });
    }

    // Call Dojah API
    const response = await fetch(DOJAH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AppId': process.env.DOJAH_APP_ID!,
        'Authorization': `Bearer ${process.env.DOJAH_API_SECRET!}`
      },
      body: JSON.stringify({
        nin,
        selfie_image
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Dojah API error:', data);
      return NextResponse.json({ 
        error: 'Failed to verify NIN' 
      }, { status: response.status });
    }

    // Check selfie verification confidence
    const confidenceValue = data.entity?.selfie_verification?.confidence_value;
    const isMatch = confidenceValue >= 90;

    return NextResponse.json({
      status: 'success',
      entity: {
        ...data.entity,
        selfie_verification: {
          ...data.entity.selfie_verification,
          match: isMatch
        }
      }
    });

  } catch (error) {
    console.error('NIN verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 