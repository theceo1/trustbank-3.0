// app/api/webhooks/dojah/manage/route.ts
import { NextResponse } from 'next/server';

const DOJAH_API_URL = process.env.NEXT_PUBLIC_DOJAH_API_URL;

export async function POST(request: Request) {
  try {
    const response = await fetch(`${DOJAH_API_URL}/api/v1/webhook/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AppId': process.env.DOJAH_APP_ID!,
        'Authorization': process.env.DOJAH_API_KEY!
      },
      body: JSON.stringify({
        webhook: process.env.NODE_ENV === 'production' 
          ? 'https://www.trustbank.tech/api/webhooks/dojah'
          : 'https://99b2-102-67-1-6.ngrok-free.app/api/webhooks/dojah',
        service: 'kyc_widget'
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to subscribe to webhook:', error);
    return NextResponse.json({ error: 'Failed to subscribe to webhook' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch(`${DOJAH_API_URL}/api/v1/webhook/fetch`, {
      headers: {
        'AppId': process.env.DOJAH_APP_ID!,
        'Authorization': process.env.DOJAH_API_KEY!
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
} 