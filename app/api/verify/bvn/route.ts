import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { bvn, metadata } = await request.json();
    
    if (!bvn) {
      throw new Error('BVN is required');
    }

    const response = await fetch(`${process.env.DOJAH_API_URL}/api/v1/kyc/bvn`, {
      method: 'GET',
      headers: {
        'AppId': process.env.DOJAH_APP_ID!,
        'Authorization': process.env.DOJAH_API_KEY!
      },
      body: JSON.stringify({ bvn })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'BVN verification failed');
    }

    return NextResponse.json({ 
      success: true, 
      data: data.entity,
      reference: data.reference_id
    });

  } catch (error: any) {
    console.error('BVN verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Verification failed'
    }, { status: 500 });
  }
}