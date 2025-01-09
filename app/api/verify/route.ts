//app/api/verify/route.ts
import { NextResponse } from 'next/server';

const DOJAH_API_URL = `${process.env.NEXT_PUBLIC_DOJAH_API_URL}/api/v1/kyc/nin/verify`;

export const runtime = 'nodejs';
export const maxDuration = 10; // 10 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { nin, selfieImage, metadata } = await request.json();
    
    if (!selfieImage) {
      throw new Error('Selfie image is required');
    }

    // Validate base64 image size
    const sizeInBytes = Buffer.from(selfieImage, 'base64').length;
    if (sizeInBytes > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Selfie image is too large. Please try again with a smaller image.');
    }

    const response = await fetch(DOJAH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AppId': process.env.DOJAH_APP_ID!,
        'Authorization': process.env.DOJAH_API_KEY!
      },
      body: JSON.stringify({
        nin,
        selfie_image: selfieImage,
        metadata
      })
    });

    const data = await response.json();
    console.log('Dojah API Response:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Identity verification failed. Please try again.');
    }

    return NextResponse.json({ 
      success: true, 
      data: data.entity,
      reference: data.reference_id
    });

  } catch (error: any) {
    console.error('NIN verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message === 'Invalid image uploaded for selfie_image'
        ? 'Invalid selfie image. Please ensure your face is clearly visible and try again.'
        : error.message === 'Your Secret Key could not be Authorized'
          ? 'Service temporarily unavailable. Please try again later.'
          : error.message || 'Verification failed'
    }, { status: 500 });
  }
}
