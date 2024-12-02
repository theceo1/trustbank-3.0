import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { selfieImage, idImage, idType, metadata } = await request.json();
    
    if (!selfieImage || !idImage) {
      throw new Error('Both selfie and ID images are required');
    }

    const response = await fetch(`${process.env.DOJAH_API_URL}/api/v1/kyc/photoid/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AppId': process.env.DOJAH_APP_ID!,
        'Authorization': process.env.DOJAH_API_KEY!
      },
      body: JSON.stringify({
        selfie_image: selfieImage.split(',')[1],
        photoid_image: idImage.split(',')[1],
        id_type: idType
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Photo ID verification failed');
    }

    return NextResponse.json({ 
      success: true, 
      data: data.entity,
      reference: data.reference_id
    });

  } catch (error: any) {
    console.error('Photo ID verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Verification failed'
    }, { status: 500 });
  }
}