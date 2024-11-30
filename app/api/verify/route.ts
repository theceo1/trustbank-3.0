//app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { nin, selfieImage } = await request.json();
    
    if (!process.env.DOJAH_API_KEY || !process.env.DOJAH_APP_ID) {
      throw new Error('Missing Dojah API credentials');
    }

    const endpoint = 'https://api.dojah.io/api/v1/kyc/nin/verify';
    const requestBody = {
      nin,
      selfie_image: selfieImage.replace(/^data:image\/jpeg;base64,/, '')
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DOJAH_API_KEY}`,
        'AppId': process.env.DOJAH_APP_ID,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();
    
    const isVerified = responseData.entity?.selfie_verification?.match === true && 
                       responseData.entity?.selfie_verification?.confidence_value >= 90;

    return NextResponse.json({ 
      success: isVerified,
      data: responseData.entity 
    });

  } catch (error) {
    console.error('NIN verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
